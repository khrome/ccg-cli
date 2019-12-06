var Magic = require('./games/mtg');

//var card = new Magic.Card('Vesuvan Doppelganger');
var card = new Magic.Card('Dakkon Blackblade');
card.renderAscii(function(err, ascii){
    console.log(ascii);
});
