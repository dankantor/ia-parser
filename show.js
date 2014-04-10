var request = require('request');
var _ = require("underscore");
var Q = require('q');
var file = require('./file.js');

var Show = function(linksFileName, showsFileName, start, max){
    this.index = start;
    this.linksFileName = linksFileName;
    this.showsFileName = showsFileName;
    this.max = max;
    this.shows = {};
    this.list = [];
}

Show.prototype.start = function(){
    //this.run().then
    var deferred = Q.defer();
    return this.run(deferred);
}

Show.prototype.run = function(deferred){
    if(this.index < this.max){
        file.read(this.showsFileName).then(
            function(json){
                if(json !== null){
                    this.shows = JSON.parse(json);
                }
                return file.read(this.linksFileName);
            }.bind(this)
        ).then(
            function(json){
                if(json !== null){
                    this.list = JSON.parse(json);
                }
                if(!this.shows[this.list[this.index]]){
                    if(!this.list[this.index]){
                        deferred.notify('done:');
                    }
                    return this.get(this.list[this.index] + '?output=json');
                }
                else{
                    deferred.notify('have: ' + this.index);
                    return Q(null);
                }
            }.bind(this)
        ).then(
            function(json){
                if(json !== null){
                    var data = JSON.parse(json);
                    //return this.parse(data);
                    return data;
                }
                else{
                    return Q(null);
                }
            }.bind(this)
        ).then(
            function(obj){
                if(obj !== null){
                    this.shows[this.list[this.index]] = obj;
                }
                var json = JSON.stringify(this.shows); 
                return file.write(this.showsFileName, json);
            }.bind(this)
        ).then(
            function(){
                this.index++;
                this.run(deferred);
            }.bind(this),
            function(e){
                deferred.reject(e);
            }.bind(this)
        ).done();
    }
    else{
        deferred.notify('MAX');
        deferred.resolve();
    }
    return deferred.promise;
}

Show.prototype.get = function(url){
    var deferred = Q.defer();
    request(
        url,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                deferred.resolve(body);
            }
            else{
                deferred.reject(error);
            }
        }
    );
    return deferred.promise;
}

Show.prototype.parse = function(data){
    var deferred = Q.defer();
    var files = data.files;
    var obj = {};
    try{
        obj.server = data.server;
    }catch(e){}
    try{
        obj.dir = data.dir;
    }catch(e){}
    try{
        obj.misc = data.misc;
    }catch(e){}
    try{
        obj.metadata = data.metadata;
    }catch(e){}
    obj.playlist = _.filter(
        files,
        function(value, key){
            if(value.format === "VBR MP3"){
                value.key = key;
                return value;
            }
            return false;
        }
    );
    deferred.resolve(obj);
    return deferred.promise;
}

module.exports = Show;