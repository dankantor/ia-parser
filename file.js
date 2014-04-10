var fs = require('fs');
var Q = require('q');

module.exports.write = function(fileName, txt){
    var deferred = Q.defer();
    fs.writeFile(
        fileName,
        txt,
        function (err){
            if(err){
                deferred.reject(new Error(err));
            }
            else{
                deferred.resolve(txt);
            }
        }
    );
    return deferred.promise;
}

module.exports.read = function(fileName){
    var deferred = Q.defer();
    fs.readFile(
        fileName,
        'utf8',
        function(err, data){
            if(err){
                deferred.resolve(null);
            }
            else{
                deferred.resolve(data);
            }
        }
    );
    return deferred.promise;
}

module.exports.exists = function(fileName){
    var deferred = Q.defer();
    fs.exists(
        fileName, 
        function(exists){
            deferred.resolve(
                {
                    'exists': exists,
                    'fileName': fileName
                }
            );
        }
    );
    return deferred.promise;
}