var Card = require('../ccg-card');
var Deck = require('../ccg-deck');
var imageSearch = require("g-i-s");
var scryfall = require("scryfall");
var art = require('ascii-art');

// ➊ ➋ ➌ ➍ ➎ ➏ ➐ ➑ ➒ ➓
// ⚒ ⚓ ⚔ ⚖ ⚗ ⚙ ⚛ ⚜ ⚡ ☠ ☢ ☣ ☄ ⭐ ✨ ⛰
// ⏳ ⌛ ࿊ ࿋ ࿌
// ⚀ ⚁ ⚂ ⚃ ⚄ ⚅
// ♠ ♡ ♢ ♣ ♤ ♥ ♦ ♧
// ♔ ♕ ♖ ♗ ♘ ♙ ♚ ♛ ♜ ♝ ♞ ♟

// 🌳 💀 💧 🔥 ✹

// 🛹 🜉

// Graph unit chars
// ㎀ ㎁ ㎂ ㎃ ㎄ ㎅ ㎆ ㎇ ㎈ ㎉ ㎊ ㎋ ㎌ ㎍ ㎎ ㎏ ㎐ ㎑ ㎒ ㎓ ㎔ ㎕ ㎖ ㎗ ㎘ ㎙ ㎚ ㎛ ㎜ ㎝ ㎞ ㎟
// ㎠ ㎡ ㎢ ㎣ ㎤ ㎥ ㎦ ㎧ ㎨ ㎩ ㎪ ㎫ ㎬ ㎭ ㎮ ㎯ ㎰ ㎱ ㎲ ㎳ ㎴ ㎵ ㎶ ㎷ ㎸ ㎹ ㎺ ㎻ ㎼ ㎽ ㎾ ㎿
// ㏀ ㏁ ㏂ ㏃ ㏄ ㏅ ㏆ ㏇ ㏈ ㏉ ㏊ ㏋ ㏌ ㏍ ㏎ ㏏ ㏐ ㏑ ㏒ ㏓ ㏔ ㏕ ㏖ ㏗ ㏘ ㏙ ㏚ ㏛ ㏜ ㏝


// ☑ ☒
// ㄼ

var getCardData = function(name, cb, context){
    var ob = this;
    context.cache(name, function(err, results){
        if(results) return cb(undefined, results);
        scryfall.getCardByName(name, false, function(err, results){
            if(err || !results.length){
                scryfall.autocomplete(name, function(suggestions){
                    if(!suggestions.length) return cb(new Error('Not found'));
                    scryfall.getCardByName(suggestions[0], false, function(err, results){
                        context.cache(name, results, function(){
                            return cb(err, results);
                        });
                    });
                });
            }else{
                return cb(undefined, results);
            }
        });
    });
}

var cardEdge = function(type, size){
    var edge = '';
    switch(type){
        case 'l':
            edge += '╭'+"\n";
            for(var lcv=2; lcv< size; lcv++){
                edge += '│'+"\n";
            }
            edge += '╰';
            break;
        case 'r':
            edge += '╮'+"\n";
            for(var lcv=2; lcv< size; lcv++){
                edge += '│'+"\n";
            }
            edge += '╯';
            break;
    }
    return edge;
}

var getCardArt = function(name, cb){
    imageSearch('mtg "'+name+'" card', function(err, results){
        results = results.filter(function(item){
            var path = item.url.split('?').shift();
            var type = path.split('.').pop().toLowerCase();
            return type === 'jpg' ||
                type === 'jpeg' ||
                type === 'gif' ||
                type === 'png';
        });
        var topResult = results[0];
        if(topResult){
            cb(undefined, topResult)
        }
    });
}

var justify = function(str, length, char){
    if(!char) char = ' '
    var fill = [];
    while(fill.length + str.length < length){
      fill[fill.length] = char;
    }
    return str + fill.join('');
}

var boxify = function(str, width, limit, style){
    //todo: explore hyphenation
    var words = str.split(' ');
    var lines = [[]];
    var word;
    while(words.length && (
        (limit && lines.length <= limit) ||
        (!limit)
    )){
        word = words.shift();
        if(lines[lines.length-1].concat([word]).join(' ').length > width){
            lines.push([]);
        }
        lines[lines.length-1].push(word);
    }
    var result = lines.map(function(line){
        if(style) return art.style(justify(line.join(' '), width), style)
        return justify(line.join(' '), width);
    }).join("\n");
    return result;
}

var MTG = {};

var setData;

var sets = function(cb){
    if(setData) return setTimeout(function(){
        cb(null, setData);
    }, 0);
    try{
        scryfall.allSets(function(sets){
            setData = sets;
            cb(null, sets);
        });
    }catch(ex){
        cb(ex);
    }
}

MTG.set = function(name, cb){
    sets(function(ex, sets){
        var matching = sets.filter(function(set){
            console.log(set.name)
            return set.name.toLowerCase() === name || set.code === name;
        });
        if(matching[0]){
            scryfall.fromSet(matching[0].code, function(results){
                return cb(null, results);
            });
        }
    });
}

MTG.Deck = Deck.extend(function(){
    MTG.Deck.super.apply(this, arguments);
}, {

});

MTG.Card = Card.extend(function(){
    MTG.Card.super.apply(this, arguments);
}, {
    fetchData : function(cb){
        var ob = this;
        return getCardData(this.id, function(err, card){
            if(err) return cb(err);
            getCardArt(card.name, function(err, cardArt){
                if(err) return cb(err);
                card.myImage = cardArt.url;
                cb(undefined, card);
            }, ob);
        }, ob);
    },
    renderAscii : function(cb){
        var ob = this;
        this.fetchData(function(err, card){
            var sent = function(s){
                return new RegExp('\\{'+s+'\\}', 'g');
            }
            if(true){

                card.mana_cost = card.mana_cost
                    .replace(sent(1), '➊')
                    .replace(sent(2), '➋')
                    .replace(sent(3), '➌')
                    .replace(sent(4), '➍')
                    .replace(sent(5), '➎')
                    .replace(sent(6), '➏')
                    .replace(sent(7), '➐')
                    .replace(sent(8), '➑')
                    .replace(sent(9), '➒')
                    .replace(sent(10), '➓')
                    .replace(sent('U'), art.style(' ⬮', 'blue', true)) //'💧'
                    .replace(sent('B'), art.style(' ☠', 'white', true)) //'☠' || '💀'
                    .replace(sent('G'), art.style(' ⚘', 'green', true)) //'🌳'
                    .replace(sent('R'), art.style(' ♨', 'red', true)) //'♨' || '🔥'
                    .replace(sent('W'), art.style(' ⚙', 'white', true)) //'☼' || '💮'
            }
            ob.getImage(card.myImage, function(err, location){
                art.image({
                    filepath: location,
                    alphabet : 'blocks',
                    posterize: true,
                    threshold: 150,
                    stipple:true,
                    blended: true,
                    width : 60
                }).overlay(
                    art.style(
                        justify(card.name, 25),
                        'bright_white+bright_black_bg'
                    )+'\033[0m\033[49m ', {
                    x: 5,
                    y: 2
                }).overlay(
                    art.style(card.mana_cost, 'bright_white+bright_black_bg', true), {
                    x: -5,
                    y: 2
                }).overlay(
                    card.type_line, {
                    x: 5,
                    y: 22
                }).overlay(
                    card.power?card.power+'/'+card.toughness+' ':'', {
                    x: -7,
                    y: 37
                }).border({
                    l: '│', r: '│', t: '─', b: '─',
                    ll:'╰', lr:'╯', ul:'╭', ur:'╮',
                    style: "bright_black"
                }).overlay(
                    boxify(card.oracle_text, 43, 8, 'black'), {
                    x: 9,
                    y: 26
                }, function(err, ascii){
                    cb(err, ascii);
                });
            });
        });
    }
})

var cardEdge = function(type, size){
    var edge = '';
    switch(type){
        case 'l':
            edge += '╭'+"\n";
            for(var lcv=2; lcv< size; lcv++){
                edge += '│'+"\n";
            }
            edge += '╰';
            break;
        case 'r':
            edge += '╮'+"\n";
            for(var lcv=2; lcv< size; lcv++){
                edge += '│'+"\n";
            }
            edge += '╯';
            break;
    }
    return edge;
}

module.exports = MTG;
