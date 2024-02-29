//var request = require('request');
//var art = require('ascii-art');
import imageSearch from 'g-i-s';
//import * as art from 'ascii-art';
import * as mod from 'module';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
ensureRequire();
const art = internalRequire('ascii-art')
import { File, Path, FileBuffer } from '@environment-safe/file';
import scryfall from 'scryfall';
import { hash } from './hash.mjs';
import { cardEdge, justify, boxify } from './util.mjs';


export class Card{
    constructor(options={}){
        this.options = options;
        if(options.name) this.name = options.name;
        if(options.cache) this.cacheDir = options.cache;
    }
    
    async id(){
        return this.options.id || await hash(
            'SHA-256', 
            FileBuffer.from(this.options.name)
        );
    }
    
    async localData(info={}){
        const id = await this.id();
        const cache = this.cacheDir || Path.location('temporary');
        const location = Path.join(cache, `${id}.data.txt`);
        if(!await File.exists(location)){
            const text = JSON.stringify(await this.data());
            const file = new File(location);
            file.setBuffer(FileBuffer.from(text));
            await file.save();
        }
        const file = new File(location);
        await file.load();
        return JSON.parse(file.body().cast('string'));
    }
    
    async data(info={}){
        return await new Promise((resolve, reject)=>{
            const name = this.name || info.name;
            scryfall.getCardByName(name, false, (err, results)=>{
                if(err || !results.length){
                    scryfall.autocomplete(name, (suggestions)=>{
                        if(!suggestions.length) return reject(new Error('Not found'));
                        scryfall.getCardByName(suggestions[0], false, (err2, results2)=>{
                            if(err2) return reject(err2);
                            resolve(results2);
                        });
                    });
                }else{
                    resolve(results);
                }
            });
        });
    }
    
    async localImage(info={}){
        const id = await this.id();
        const cache = this.cacheDir || Path.location('temporary');
        const location = Path.join(cache, `${id}.card.jpg`);
        if(!await File.exists(location)){
            const result = await this.imageSearch();
            result.file.path = location;
            await result.file.save();
        }
        const file = new File(location);
        await file.load();
        return {
            file
        };
    }
    
    async imageSearch(info={}){ // default to a google search
        const name = this.name || info.name;
        return await new Promise((resolve, reject)=>{
            const search = 'mtg "'+name+'" card';
            imageSearch(search, async function(err, results){
                if(err) return reject(err);
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
                    const file = new File(topResult.url);
                    await file.load();
                    resolve({
                        file: file,
                        meta: topResult
                    });
                }else{
                    reject(new Error('no results'));
                }
            });
        });
    }
    
    async ansi(){
        const image = await this.localImage();
        const data = await this.localData();
        const sent = function(s){
            return new RegExp('\\{'+s+'\\}', 'g');
        }
        data.mana_cost = data.mana_cost
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
        const ansi = await new Promise((resolve, reject)=>{
            art.image({
                filepath: image.file.path,
                alphabet : 'blocks',
                posterize: true,
                threshold: 150,
                stipple:true,
                blended: true,
                width : 60
            }).overlay(
                art.style(
                    justify(data.name, 25),
                    'bright_white+bright_black_bg'
                )+'\x1b[0m\x1b[49m ', {
                x: 5,
                y: 2
            }).overlay(
                art.style(data.mana_cost, 'bright_white+bright_black_bg', true), {
                x: -5,
                y: 2
            }).overlay(
                data.type_line, {
                x: 5,
                y: 22
            }).overlay(
                data.power?data.power+'/'+data.toughness+' ':'', {
                x: -7,
                y: 37
            }).border({
                l: '│', r: '│', t: '─', b: '─',
                ll:'╰', lr:'╯', ul:'╭', ur:'╮',
                style: "bright_black"
            }).overlay(
                boxify(data.oracle_text, 43, 8, 'black'), {
                x: 9,
                y: 26
            }, function(err, ascii){
                if(err) return reject(reject);
                resolve(ascii);
            });
        });
        return ansi;
    }
    
    async localImage(info={}){
        const id = await this.id();
        const cache = this.cacheDir || Path.location('temporary');
        const location = Path.join(cache, `${id}.card.jpg`);
        if(!await File.exists(location)){
            const result = await this.imageSearch();
            result.file.path = location;
            await result.file.save();
        }
        const file = new File(location);
        await file.load();
        return {
            file
        };
    }
}
