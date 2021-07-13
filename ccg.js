var card = 'Vesuvan Doppelganger';

var CCG = function(name){
    return require('../games/'+name);
}
CCG.Card = require('./ccg-card')
CCG.Deck = require('./ccg-deck')

var lossyGet = function(name, cb){
    scryfall.getCardByName(card, false, function(err, results){
        if(err || !results.length){
            scryfall.autocomplete(card, function(suggestions){
                if(!suggestions.length) return callback(new Error('Not found'));
                scryfall.getCardByName(suggestions[0], false, function(err, results){
                    return cb(err, results);
                });
            });
        }else{
            return cb(undefined, results);
        }
    });
}

imageSearch('mtg "'+card+'" card', function(err, results){
    var topResult = results[0];
    if(topResult){
        lossyGet(card, function(err, results){
            console.log('??',err,  topResult, results)
        });
    }
});
