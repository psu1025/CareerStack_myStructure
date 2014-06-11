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

                        var sortingCategoryItems = doc.categoryList;
                        sortingCategoryItems.forEach(function(item, index){
                            //careerList를 글 쓴 역순으로 정렬
                            item.careerList = item.careerList.sort(function(a,b){
                                return b.write_time - a.write_time;
                            });
                        });

                        //categoryList를 가지고 render
                        res.render(JADE_PATH+'mypage.jade', {
                            name:req.user.name,
                            categoryItems: sortingCategoryItems,
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

exports.viewJoin = function(req, res){
    res.render(JADE_PATH+'join.jade');
};

exports.viewCareerMain = function(req, res){
    var user = req.user;
    var career_id = req.params.career;
    var category = req.params.category;

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
                doc.categoryList.forEach(function(categoryItem, index){
                    if(categoryItem.name == category){
                        categoryItem.careerList.forEach(function(career, index){
                            if(career._id == career_id){
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

                    //시간 역순으로 정렬
                    careerItems = careerItems.sort(function(a, b){
                        return b.write_time - a.write_time;
                    });

                    res.render(JADE_PATH+'careerList.jade', {
                        user_id: user._id,
                        name: user.name,
                        categoryItems: doc.categoryList,
                        selectCategory: req.params.category,
                        careerItems: careerItems,
                        introduceUrl: doc.introduceUrl
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

var templates = {
    plan:[
        {
            name:"기획 아이템",
            type:"memo"
        },
        {
            name:"참여자",
            type:"memo"
        },
        {
            name:"기간",
            type:"period"
        },
        {
            name:"플랜 이미지",
            type:"image"
        },
        {
            name:"기획 내용 상세",
            type:"text"
        },
        {
            name:"기획 파일 첨부",
            type:"file"
        }
    ],

    project:[
        {
            name:"프로젝트 아이템",
            type:"memo"
        },
        {
            name:"참여자",
            type:"memo"
        },
        {
            name:"기간",
            type:"period"
        },
        {
            name:"프로젝트 이미지",
            type:"image"
        },
        {
            name:"프로젝트 내용 상세",
            type:"text"
        },
        {
            name:"프로젝트 파일 첨부",
            type:"file"
        }
    ],

    journey:[
        {
            name:"여행 장소",
            type:"memo"
        },
        {
            name:"여행 기간",
            type:"period"
        },
        {
            name:"여행 사진",
            type:"image"
        },
        {
            name:"기억에 남는 일",
            type:"text"
        },
        {
            name:"참고 링크",
            type:"link"
        }
    ],

    photo:[
        {
            name:"촬영 장소",
            type:"memo"
        },
        {
            name:"촬영일",
            type:"date"
        },
        {
            name:"촬영 컨셉",
            type:"memo"
        },
        {
            name:"사진",
            type:"image"
        },
        {
            name:"사진",
            type:"image"
        },
        {
            name:"사진",
            type:"image"
        },
        {
            name:"촬영 에피소드",
            type:"text"
        }
    ],

    free:[
        {
            name:"자유 메모",
            type:"memo"
        },
        {
            name:"자유 긴글",
            type:"text"
        }
    ]
};

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
                        name:user.name,
                        categoryItems:doc.categoryList,
                        introduceUrl:doc.introduceUrl,
                        user_id:user._id,

                        writeTemplates:templates[req.params.template]
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


exports.editCareer = function(req, res){
    var career_id = req.params.career;
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

                    var portfolio = null;

                    doc.categoryList.forEach(function(categoryItem, categoryIndex){
                        categoryItem.careerList.forEach(function(careerItem, careerIndex){
                            if(careerItem._id == career_id){
                                portfolio = careerItem;
                            }
                        });
                    });

                    //categoryList를 가지고 render
                    res.render(JADE_PATH+'editCareer.jade', {
                        name:user.name,
                        categoryItems:doc.categoryList,
                        introduceUrl:doc.introduceUrl,
                        user_id:user._id,
                        writeTemplates:portfolio,
                        career_id:career_id
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

exports.delCareer = function(req, res){
    var result = 999;
    var data = {};

    var careerData = req.body;
    var career_id = req.params.career;

    schema.scUser.findOne({_id:req.user._id})
        .exec(function(err, doc){
            if(err){
                req.logout();
                res.redirect('/view/main');
                return;
            }
            else{
                var successFlag = false;

                //기존 삭제
                doc.categoryList.forEach(function(category, index){
                    category.careerList.forEach(function(careerItem, index){
                        if(careerItem._id == career_id){
                            category.careerList.splice(index, 1);
                            doc.save();
                            successFlag = true;
                        }
                    });
                });

                //결과 처리
                if(successFlag == true){
                    res.redirect('/view/mypage');
                    return;
                }
                else{
                    req.logout();
                    res.redirect('/view/main');
                    return;
                }
            }
        });
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