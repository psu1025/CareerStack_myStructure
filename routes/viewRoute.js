/**
 * Created by Augustus on 14. 5. 15.
 */

////////////////////////////////////////////////
// 모듈 요청
////////////////////////////////////////////////
var fs = require('fs'),
    jade = require('jade'),
    util = require('util');

var schema = require('./schema.js');

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
    res.render(JADE_PATH+'main.jade', {title:'Career Stack'});
};

exports.viewMyPage = function(req, res){
    var user = req.user;
    schema.scUser.findOne({_id:user._id}).select('categoryList')
        .exec(
            function(err, doc){
                if(err){
                    //에러가 난 경우 메인으로
                    result = 780;
                    req.logout();
                    res.redirect('/view/main');
                    return;
                }
                else{
                    if(doc){
                        //categoryList를 가지고 render
                        console.log(util.inspect(doc));
                        res.render(JADE_PATH+'mypage.jade', {
                            name:req.user.name,
                            categoryItems:doc.categoryList
                        });
                    }
                    else{
                        //아예 카테고리가 없다 -> 메인으로
                        result = 780;
                        req.logout();
                        res.redirect('/view/main');
                        return;
                    }
                }
            }
        );


};

exports.viewJoin = function(req, res){
    res.render(JADE_PATH+'join.jade');
};

exports.viewJoinProcess = function(req, res){
//    var data = {};
//    data.result = 200;
    res.json({"result":"200"});
};


exports.mapTest = function(req, res){
    fs.readFile(JADE_PATH+'maptest.html', 'utf8', function(error, data){
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(data);
    })
};

exports.testJade = function(req, res){
    res.render(JADE_PATH+'test.jade');
};