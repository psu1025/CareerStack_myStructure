/**
 * Created by Augustus on 14. 5. 15.
 */

////////////////////////////////////////////////
// 모듈 요청
////////////////////////////////////////////////
var fs = require('fs'),
    jade = require('jade');

////////////////////////////////////////////////
//전역 상수들
////////////////////////////////////////////////
var USER_ORIGIN_PICTURE_PATH = __dirname + '/../public/images/User/';
var USER_THUMB_PICTURE_PATH = __dirname +'/../public/images/User/thumbnail/';
var ACT_ORIGIN_IMAGE_PATH = __dirname + '/../public/images/Activity/';
var ACT_THUMB_IMAGE_PATH = __dirname + '/../public/images/Activity/thumbnail/';
var ACT_FILE_PATH =__dirname + '/../public/files/Activity/';

var USER_ORIGIN_PICTURE_PATH_RES = '/images/User/';
var USER_THUMB_PICTURE_PATH_RES = '/images/User/thumbnail/';
var ACT_ORIGIN_IMAGE_PATH_RES = '/images/Activity/';
var ACT_THUMB_IMAGE_PATH_RES = '/images/Activity/thumbnail/';
var ACT_FILE_PATH_RES = '/files/Activity/';

var JADE_PATH = __dirname + '/../views/';

exports.viewMain = function(req, res){
    fs.readFile(JADE_PATH+'main.jade', 'utf8', function(error, data){
        var fn = jade.compile(data);

        res.writeHead(200, {'Content-type':'text/html'});
        res.end(fn({
            title: 'first jade title'
        }));
    })
};

exports.mapTest = function(req, res){
    fs.readFile(JADE_PATH+'maptest.html', 'utf8', function(error, data){
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(data);
    })
}