var request = require('request');
var art = require('ascii-art');
var fs = require('fs');

var Deck = function(cards, Card){
    this.names = ['hand', 'deck', 'discard'];
    this.contexts = {};
    this.definitions = {};
    this.cards = cards || []; //original state of deck
    var ob = this;
    this.cards.forEach(function(name){
        if(!ob.definitions[name]) ob.definitions[name] = new Card(name);
    });

}

Deck.extend = function(constructor, proto){
    Object.keys(Deck.prototype).forEach(function(key){
        constructor.prototype[key] = Deck.prototype[key];
    });
    Object.keys(proto).forEach(function(key){
        constructor.prototype[key] = proto[key];
    });
    constructor.super = Deck;
    return constructor;
};

Deck.prototype.draw = function(count, src, dest){
    var source = src || 'deck';
    var destination = dest || 'hand';
    var cards = new Array(count);
    var ob = this;
    cards.forEach(function(item, index){
        cards[index] = library.pop();
        hand.push(cards[index]);
    });
    return cards;
}

Deck.prototype.shuffle = function(targ){
    var target = targ || 'deck';
    var halfSize = Math.floor(this.contexts[target].length/2);
    var a = this.contexts[target].slice(0, halfSize);
    var b = this.contexts[target].slice(halfSize);
    var shuffled = [];
    var fuzziness = 0.9; // ratio of accuracy at perfectly interleaving cards
    //TODO: create a chunkiness factor (how much you let cards chunk together as they flip)
    while(a.length !== 0 || b.length !== 0){
        if(Math.random() < fuzziness){
            shuffled.push(a.shift());
        }
        if(Math.random() < fuzziness){
            shuffled.push(b.shift());
        }
    }
    return this;
}

Deck.prototype.collect = function(targ){
    var target = targ || 'deck';
    var ob = this;
    var result = [];
    this.name.forEach(function(name, index){
        result = result.concat(ob.contexts[name]);
        ob.contexts[name] = [];
    });
    ob.contexts[target] = result;
    return this;
}

Deck.prototype.fetchData = function(cb){
    this.id;
}

Deck.prototype.getData = function(cb){
    return this.fetchData(cb);
}

Deck.prototype.cache = function(id, value, cb){
    var cache = this.cacheDir || '/tmp/';
    if(!cb){
        cb = value;
        var cache = this.cacheDir || '/tmp/';
        fs.readFile(cache+id, function(err, body){
            if(err) return cb(err);
            if(body && !err){
                //console.log('CACHE HIT');
                cb(undefined, JSON.parse(body));
            }
        })
    }else{
        fs.writeFile(
            cache+id,
            JSON.stringify(value, undefined, '    '),
            function(err, body){
                if(err) return cb(err);
                if(body && !err){
                    cb(undefined, JSON.parse(body));
                }
            }
        )
    }
}

Deck.prototype.renderAscii = function(view, cb){
    var ob = this;
    this.getData(function(err, data){
        ob.getImage(data.image, function(err, location){
            if(err) throw err;
            art.image({
                filepath: location,
                width: 60
            }, function(err, ascii){
                cb(err, ascii);
            });
        });
    });
}
module.exports = Deck;
