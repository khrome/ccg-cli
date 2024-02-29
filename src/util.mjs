import * as mod from 'module';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
ensureRequire();
const art = internalRequire('ascii-art');

export const cardEdge = function(type, size){
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

export const justify = function(str, length, char){
    if(!char) char = ' '
    var fill = [];
    while(fill.length + str.length < length){
      fill[fill.length] = char;
    }
    return str + fill.join('');
}

export const boxify = function(str, width, limit, style){
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