var _ = require("underscore");
var Q = require('q');
var jsdom = require("jsdom");
var file = require('./file.js');

var fileName = 'data/artists.json';

var Artist = function(){
}

Artist.prototype.start = function(url){
    var deferred = Q.defer();
    this.get(url).then(
        function(window){
            return this.parse(window, deferred);
        }.bind(this)
    ).then(
        function(list){
            var json = JSON.stringify(list);
            return file.write(fileName, json);
        }.bind(this)
    ).then(
        function(text){
            deferred.resolve();
        }.bind(this),
        function(e){
            deferred.reject(e);
        }.bind(this)
    );
    return deferred.promise;
}

Artist.prototype.get = function(url){
    var deferred = Q.defer();
    console.log('get:', url);
    jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (errors, window) {
            if(!errors){
                deferred.resolve(window); 
            }
            else{
                deferred.reject(errors);
            }
        }
    );
    return deferred.promise;
}

Artist.prototype.parse = function(window, d){
    var deferred = Q.defer();
    var links = window.$('#browse').find('a');
    var len = links.length;
    d.notify('links:', len);
    var list = [];
    for(var i = 0; i < len; i++){
        var link = links[i];
        d.notify(i);
        var obj = {
            'artist': link.innerHTML,
            'url': link.href
        }
        list.push(obj);
    }
    deferred.resolve(list);
    return deferred.promise;
}

Artist.prototype.getList = function(){
    var deferred = Q.defer();
    file.read(fileName).then(
        function(json){
            var list = JSON.parse(json);
            deferred.resolve(list);
        },
        function(e){
            deferred.reject(e);
        }
    )
    return deferred.promise;
}


module.exports = Artist;