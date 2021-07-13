var request = require('request');
var art = require('ascii-art');
var fs = require('fs');

var Card = function(id){
    this.id = id;
}

Card.extend = function(constructor, proto){
    Object.keys(Card.prototype).forEach(function(key){
        constructor.prototype[key] = Card.prototype[key];
    });
    Object.keys(proto).forEach(function(key){
        constructor.prototype[key] = proto[key];
    });
    constructor.super = Card;
    return constructor;
};
Card.prototype.fetchData = function(cb){
    this.id;
}

Card.prototype.getData = function(cb){
    return this.fetchData(cb);
}

Card.prototype.getImage = function(location, cb){
    var cache = this.cacheDir || '/tmp/';
    location = location.split('?').shift();
    var fileName = location.split('/').pop();
    var type = location.split('.').pop();
    fs.stat(cache+fileName, function(err, file){
        if(err || !file){
            if(location.indexOf('http') === 0){
                request({
                    uri:location
                }).pipe(fs.createWriteStream(cache+fileName)).on('close', function(){
                    cb(undefined, cache+fileName);
                });
            }else{
                return cb(undefined, location);
            }
        }else{
            //console.log('IMAGE CACHE HIT', cache+fileName)
            cb(undefined, cache+fileName);
        }
    });
}

Card.prototype.cache = function(id, value, cb){
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

Card.prototype.renderAscii = function(cb){
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
module.exports = Card;
