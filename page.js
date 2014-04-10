var _ = require("underscore");
var Q = require('q');
var jsdom = require("jsdom");
var file = require('./file.js');

var Page = function(fileName, max){
    this.page = 1;
    this.fileName = fileName;
    this.max = max;
}

Page.prototype.start = function(url){
    var deferred = Q.defer();
    if(this.page < this.max){
        this.get(url).then(
            function(window){
                this.window = window;
                return file.read(this.fileName);
            }.bind(this)
        ).then(
            function(json){
                var list = [];
                if(json !== null){
                    list = JSON.parse(json);
                }
                return this.parse(this.window, list);
            }.bind(this)
        ).then(
            function(list){
                var json = JSON.stringify(list);
                return file.write(this.fileName, json);
            }.bind(this)
        ).then(
            function(text){
                var nextLink = this.getNext(this.window);
                this.page++;
                this.start(nextLink.href);
            }.bind(this),
            function(e){
                //console.log('error', e);
            }.bind(this)
        );
    }
    else{
        console.log('over max', this.fileName);
        deferred.resolve();
    }
    return deferred.promise;
}

Page.prototype.get = function(url){
    var deferred = Q.defer();
    //console.log('get:', url);
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

Page.prototype.parse = function(window, file){
    var deferred = Q.defer();
    var links = window.$('a.titleLink');
    _.each(
        links,
        function(link){
            if(file.indexOf(link.href) === -1){
                file.push(link.href);
            }
        }
    );
    deferred.resolve(file);
    return deferred.promise;
}

Page.prototype.getNext = function(window){
    var links = window.$('a');
    return _.find(
        links,
        function(link){ 
            if(link.innerHTML === 'Next'){
                console.log(link.href);
                return true;
            } 
            return false;
        }
    );
}

module.exports = Page;