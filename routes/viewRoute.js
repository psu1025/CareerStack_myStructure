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
    schema.scUser.findOne({_id:user._id})
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
                        res.render(JADE_PATH+'mypage.jade', {
                            name:req.user.name,
                            categoryItems:doc.categoryList,
                            introduceUrl:doc.introduceUrl
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

exports.viewCareerMain = function(req, res){
    var user = req.user;
    var career_id = req.params.career;
    var category = req.params.category;

    console.log(util.inspect(career_id));
    console.log(util.inspect(category));

    schema.scUser.findOne({_id:user._id})
        .exec(
        function(err, doc){
            if(err){
                console.log(err);
                req.logout();
                res.redirect('/view/main');
                return;
            }
            else{
                console.log(util.inspect(doc));

                doc.categoryList.forEach(function(categoryItem, index){
                    if(categoryItem.name == category){
                        categoryItem.careerList.forEach(function(career, index){
                            console.log(util.inspect(career));
                            if(career._id == career_id){
                                console.log(util.inspect(career));
                                res.render(JADE_PATH + 'showCareer.jade',{
                                    name:req.user.name,
                                    categoryItems:doc.categoryList,
                                    selectCategory:category,
                                    introduceUrl:doc.introduceUrl,

                                    user_id:req.user._id,
                                    category:category,


                                    careerName: career.name,
                                    templateList:career.templateList
                                });
                            }
                        });
                    }
                });
            }
        }
    );
}

exports.viewCareerList = function(req, res){
    var user = req.user;
    schema.scUser.findOne({_id:user._id})
        .exec(
        function(err, doc){
            if(err){
                //에러가 난 경우 메인으로
                req.logout();
                res.redirect('/view/main');
                return;
            }
            else{
                if(doc){
                    //categoryList를 가지고 render

                    var careerItems = null;
                    doc.categoryList.forEach(function(categoryItem, index){
                        if(categoryItem.name == req.params.category){
                            careerItems = categoryItem.careerList;
                        }
                    });

                    res.render(JADE_PATH+'careerList.jade', {
                        name:req.user.name,
                        categoryItems:doc.categoryList,
                        selectCategory:req.params.category,
                        careerItems:careerItems,
                        introduceUrl:doc.introduceUrl
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

exports.selectTemplate = function(req, res){
    var user = req.user;
    schema.scUser.findOne({_id:user._id})
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
                    res.render(JADE_PATH+'selectTemplate.jade', {
                        name:req.user.name,
                        categoryItems:doc.categoryList,
                        selectCategory:req.params.category,
                        careerItems:{"length":0},
                        introduceUrl:doc.introduceUrl
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
;}

exports.writeCareer = function(req, res){
    var user = req.user;
    schema.scUser.findOne({_id:user._id})
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
                    res.render(JADE_PATH+'writeCareer.jade', {
                        name:req.user.name,
                        categoryItems:doc.categoryList,
                        selectCategory:req.params.category,
                        templateItems:{"length":0},
                        introduceUrl:doc.introduceUrl,
                        user_id:user._id
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

exports.setting = function(req, res){
    var user = req.user;
    schema.scUser.findOne({_id:user._id})
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
                    res.render(JADE_PATH+'setting.jade', {
                        name:req.user.name,
                        categoryItems:doc.categoryList,
                        selectCategory:req.params.category,
                        introduceUrl:doc.introduceUrl
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


exports.mapTest = function(req, res){
    fs.readFile(JADE_PATH+'maptest.html', 'utf8', function(error, data){
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(data);
    })
};

exports.testJade = function(req, res){
    res.render(JADE_PATH+'test.jade');
};