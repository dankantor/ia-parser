var Page = require('./page.js');
var Show = require('./show.js');
var Artist = require('./artist.js');
var _ = require("underscore");
var file = require('./file.js');


//var firstUrl = "http://archive.org/search.php?query=collection%3A%28GratefulDead%20AND%20etree%29%20AND%20-collection%3Astream_only&page=87";
//var fileName = "gd-links.json";

//var firstUrl = "http://archive.org/search.php?query=collection%3Aetree%20AND%20format%3Amp3%20AND%20creator%3A%22Jack%20Johnson%22";
//var linksFileName = "data/links/jack-johnson-links.json";
//var showsFileName = "data/shows/jack-johnson-shows.json";

console.time('Total');

function getSingleArtistLinks(linksFileName, firstUrl){
    var page = new Page(linksFileName, 20);
    page.start(firstUrl).then(
        function(){
            console.timeEnd('Total');
        }
    );
}

function getManyArtistLinks(start, stop){
    console.log('getManyArtistLinks', start, stop);
    var artist = new Artist();
    artist.getList().then(
        function(list){
            var len = list.length;
            console.log(list.length);
            for(var i = start; i < stop; i++){
                var obj = list[i];
                var page = new Page('data/links/' + obj.artist + '-links.json', 50);
                page.start(obj.url).then(
                    function(){
                        console.timeEnd('Total');
                    }
                );
            }
        },
        function(e){
            console.log(e);
        }
    );
}

function testArtists(){
    var c = 0;
    var d = 0;
    var artist = new Artist();
    artist.getList().then(
        function(list){
            _.each(
                list,
                function(obj){
                    file.exists('data/links/' + obj.artist + '-links.json').then(
                        function(answer){
                            if(answer.exists === false && c < 250){
                                console.log(c, obj.artist);
                                var page = new Page('data/links/' + obj.artist + '-links.json', 50);
                                page.start(obj.url).then(
                                    function(){
                                        
                                    },
                                    function(e){
                                        console.log(e);
                                    }
                                );
                                c++;
                            }
                            if(answer.exists === false){
                                d++;
                                console.log(d);
                            }
                        }
                    );
                }
            );
        },
        function(e){
            console.log(e);
        }
    );
}

function getShow(){
    var show = new Show(linksFileName, showsFileName, 69, 150);
    show.start().then(
        function(){
            console.timeEnd('Total');
        },
        function(e){
            console.log('error', e);
        },
        function(progress){
            console.log('show:', progress);
        }
    );
}

function getManyShows(start){
    var total = 5;
    console.log('getManyShows', start, total);
    var artist = new Artist();
    artist.getList().then(
        function(list){
            return list.splice(start, total);
        }  
    ).then(
        function(list){
            _.each(
                list,
                function(obj){
                    var show = new Show(
                        'data/links/' + obj.artist + '-links.json',
                        'data/shows/' + obj.artist + '-shows.json', 
                        0, 
                        150
                    );
                    show.start().then(
                        function(){
                            console.log('done:', obj.artist);
                        },
                        function(e){
                            console.log(e);
                        },
                        function(progress){
                            console.log(progress, obj.artist);
                        }
                    );
                }
            );
        }
    )
}

function getArtists(){
    var artist = new Artist();
    artist.start('http://archive.org/browse.php?field=/metadata/bandWithMP3s&collection=etree').then(
        function(){
            console.timeEnd('Total');
        },
        function(e){
            console.log('error', e);
        },
        function(progress){
            console.log('artist:', progress);
        }
    );
}

getManyShows(45);




