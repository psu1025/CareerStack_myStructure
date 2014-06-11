/*
 * Author: Aristein
 * Create Date: 14. 05. 10
 * Project Name: Career Stack
 * Version: 0.1.0
 * Filename: index.js
 * Detail: 실 구현부
 */

/*****************************************************************
 * INITIALIZE
 *****************************************************************/
////////////////////////////////////////////////
// 모듈 요청
////////////////////////////////////////////////
var mongoose = require('mongoose'),
    mongodb = require('mongodb'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    util = require('util'),
    async = require('async'),
    fs = require('fs'),
    fstools = require('fs-tools'),
    easyimage = require('easyimage'),
    path = require('path'),
    moment = require('moment'),
    passport = require('passport');

var schema = require('./schema.js');

var ObjectId = mongoose.Types.ObjectId;

////////////////////////////////////////////////
//Mongodb Connect
////////////////////////////////////////////////

//Local DB
var optionsLocal = {
    db: {native_parser: true},
    server: {poolSize: 10}
};

//Server DB
var optionsServer = {
    db: {native_parser: true},
    server: {poolSize: 10},
    user: 'aristein',
    pass: 'dnlwkem@1'
};

mongoose.connect('mongodb://54.178.136.239:27017/CareerStack', optionsServer);   //Server Connect
//mongoose.connect('mongodb://54.178.136.239:27017:27017/test', optionsServer);             //Local Connect
var dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'db connection error'));

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

////////////////////////////////////////////////
//공용 함수들
////////////////////////////////////////////////

//유효성 체크
// [], {}, = new isArray(), null, undefined인 경우 true반환. 결국 내부에 뭔가 없으면 true.
// Date형식일 경우에는 못 잡아오는 에러가 있다.
var isEmpty = function(obj) {

    if(typeof obj == 'number'){
        obj = obj.toString();
    }

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length == 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }

    return true;
};

//아이템이 Array로 들어오고, 하나라도 empty가 아니라면 flase를 return한다.
var areEmpty = function(objArray){
    if(!Array.isArray(objArray)){
        return 'is Not Array';
    }

    var isEmptyFlag = false;

    //Array내부 탐색
    objArray.forEach(function(item, idx){
        if(isEmpty(item)){
            isEmptyFlag = true;
            return;
        }
    });

    if(isEmptyFlag == true){
        return true;
    }
    else{
        return false;
    }
};


var isLengthZero = function(obj){
    if(obj == null) return true;

    obj = obj.toString();
    if(obj.length > 0) return false;
    return true;
};


// Date타입에서 날짜를 yyyy-mm-dd형태로 바꿔주는 함수
Date.prototype.getyyyymmdd = function(){
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

Date.prototype.getKoreaDate = function() {
    //우리나라니까 9시간 더해줌
    this.setHours(this.getHours() + 9);

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

// Date타입에서 날짜를 yyyy-mm-dd hh:mm:ss 형태로 바꿔주는 함수
Date.prototype.getKoreaeDatetime = function() {
    //우리나라니까 9시간 더해줌
    this.setHours(this.getHours() + 9);

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();

    var hh = this.getHours();
    var m = this.getMinutes();
    var ss = this.getSeconds();
    if(hh < 10) hh = '0' + hh;
    if(m < 10) m = '0' + m;
    if(ss < 10) ss = '0' + ss;

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]) + ' ' + hh + ":" + m + ":" + ss;
};


////////////////////////////////////////////////
//API 공용 함수들
////////////////////////////////////////////////
var defaultCategoryList = [
    new schema.scCategory({
        name:"Plan",
        description:"기획에 관한 포트폴리오를 추가하세요"
    }),
    new schema.scCategory({
        name:"Design",
        description:"디자인에 관한 포트폴리오를 추가하세요"
    }),
    new schema.scCategory({
        name:"Development",
        description:"개발에 관한 포트폴리오를 추가하세요"
    }),
    new schema.scCategory({
        name:"Project",
        description:"프로젝트에 관한 포트폴리오를 추가하세요"
    }),
    new schema.scCategory({
        name:"Besides",
        description:"기타 포트폴리오를 추가하세요"
    }),
    new schema.scCategory({
        name:"Photo",
        description:"사진에 관한 포트폴리오를 추가하세요"
    })
];

////////////////////////////////////////////////
//API 목록
////////////////////////////////////////////////
exports.initial = function(req, res){
    res.json({"initial": "0.1.0"});
};

exports.logout = function(req, res){
    req.logout();
    res.clearCookie('authcode');
    res.clearCookie('SESSION');
    res.redirect('/view/main');
};


exports.test = function(req, res){
    console.log(util.inspect(req.body.user));
    res.json({"good":"good"});
}

exports.signUser = function(req, res){
    var result = 999;
    var data = {};

    if(req.ensureAuth == true){
        result = 202;
        data.result = result;
        res.json(data);
        return;
    }

    //data Validate. 없으면 888
    var bodyData = req.body.user;
    if(areEmpty([bodyData.email, bodyData.password, bodyData.name, bodyData.birth]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    //필수입력정보들 parsing
    var userPwd = bodyData.password;
    var userRePwd = bodyData.repassword;
    var userEmail = bodyData.email;
    var userName = bodyData.name;
    var userBirth = bodyData.birth;

    if(userPwd != userRePwd){
        result = 203;
        data.result = result;
        res.json(data);
        return;
    }

    //이미 이 이메일로 가입된 유저가 있는지 확인
    schema.scUser.where('email').equals(userEmail).exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            if(docs.length > 0){
                //이미 이 이메일로 가입된 유저가 있는 경우
                result = 201;
                data.result = result;
                res.json(data);
                return;
            }
            else{
                //없는 경우
                var salt = Math.round((new Date()).valueOf() * Math.random()) + '';
                var hashPasswd = crypto.createHash('sha512').update(salt+userPwd).digest('hex');

                new schema.scUser({
                    email:userEmail,
                    hashPassword:hashPasswd,
                    salt:salt,
                    name:userName,
                    birth:userBirth,
                    categoryList:defaultCategoryList

                }).save(function(err, docs){
                        if(err){
                            result = 780;
                        }
                        else{
                            //성공
                            result = 200;
                        }

                        data.result = result;
                        res.json(data);
                        return;
                    });
            }
        }
    });
};

exports.editUserInfo = function(req, res){
    var result = 999;
    var data = {};
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //수정 시 모든 데이터가 올라오므로 필수 데이터가 없으면 튕겨낸다
    var bodyData = req.body;
    if(areEmpty([bodyData.name, bodyData.birth, bodyData.email]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    //이메일은 변경불가. 만약 세션과 값이 다르면 전체 값을 삭제한다.
    if(bodyData.email.body != req.user.email.body){
        delete bodyData.email;
    }

    //비밀번호가 입력된 경우 해시화 해 준다
    if(!isEmpty(bodyData.password)){
        var salt = Math.round((new Date()).valueOf() * Math.random()) + '';
        var hashPasswd = crypto.createHash('sha512').update(salt+req.body.password).digest('hex');
        bodyData.salt = salt;
        bodyData.hashPassword = hashPasswd;
        delete bodyData.password;
    }

    schema.scUser.update(
        {_id:inputUserId},
        bodyData,
        function(err, docs){
            if(err){
                //쿼리에러
                result = 780;
            }
            else{
                if(docs > 0){
                    //성공
                    result = 210;
                }
                else{
                    //해당유저없음
                    result = 211;
                }
            }
            data.result = result;
            res.json(data);
            return;
        }
    );
};

exports.getUserInfo = function(req, res){
    var result = 999;
    var data = {};
    var model = {};

    var inputUserId = req.params.user;
    if(isEmpty(inputUserId)){
        data.result = 888;
        res.json(data);
        return;
    }

    var excludeField = '-hashPassword -salt -exit_validate -exit_date -join_date -__v -auth_code';
    schema.scUser.where('_id').equals(inputUserId)
        .select(excludeField)
        .exec(function(err, docs){
            if(err){
                result = 780;
                data.result = result;
                res.json(data);
                return;
            }
            else{
                if(docs.length > 0){

                    result = 220;
                    //아예 로그인하지 않았을 때
                    if((req.user == undefined)){
                        //Object
                        model._id = docs[0]._id;
                        if(docs[0].email.visible == true){model.email = docs[0].email;}
                        if(docs[0].name.visible == true){model.name = docs[0].name;}
                        if(docs[0].birth.visible == true){model.birth = docs[0].birth;}
                        if(docs[0].sex.visible == true){model.sex = docs[0].sex;}
                        if(docs[0].picture.visible == true){model.picture = docs[0].picture;}
                        if(docs[0].home_phone.visible == true){model.home_phone = docs[0].home_phone;}
                        if(docs[0].cell_phone.visible == true){model.cell_phone = docs[0].cell_phone;}
                        if(docs[0].homepage.visible == true){model.homepage = docs[0].homepage;}
                        if(docs[0].profile.visible == true){model.profile = docs[0].profile;}
                        if(docs[0].location.visible == true){model.location = docs[0].location;}
                        if(docs[0].hobby.visible == true){model.hobby = docs[0].hobby;}
                        if(docs[0].speciality.visible == true){model.speciality = docs[0].speciality;}
                        if(docs[0].family.visible == true){model.family = docs[0].family;}

                        //Array
                        model.work = [];
                        docs[0].work.forEach(function(item){
                            if(item.visible == true){model.work.push(item);}
                        });

                        model.user_custom = [];
                        docs[0].user_custom.forEach(function(item){
                            if(item.visible == true){model.user_custom.push(item);}
                        });

                        data.model = model;
                    }
                    //로그인했고 본인일 때
                    else if(req.user._id == inputUserId){
                        data.model = docs[0];
                    }
                    //로그인 했으나 본인이 아닐 때 혹은 그 외
                    else{
                        //Object
                        model._id = docs[0]._id;
                        if(docs[0].email.visible == true){model.email = docs[0].email;}
                        if(docs[0].name.visible == true){model.name = docs[0].name;}
                        if(docs[0].birth.visible == true){model.birth = docs[0].birth;}
                        if(docs[0].sex.visible == true){model.sex = docs[0].sex;}
                        if(docs[0].picture.visible == true){model.picture = docs[0].picture;}
                        if(docs[0].home_phone.visible == true){model.home_phone = docs[0].home_phone;}
                        if(docs[0].cell_phone.visible == true){model.cell_phone = docs[0].cell_phone;}
                        if(docs[0].homepage.visible == true){model.homepage = docs[0].homepage;}
                        if(docs[0].profile.visible == true){model.profile = docs[0].profile;}
                        if(docs[0].location.visible == true){model.location = docs[0].location;}
                        if(docs[0].hobby.visible == true){model.hobby = docs[0].hobby;}
                        if(docs[0].speciality.visible == true){model.speciality = docs[0].speciality;}
                        if(docs[0].family.visible == true){model.family = docs[0].family;}

                        //Array
                        model.work = [];
                        docs[0].work.forEach(function(item){
                            if(item.visible == true){model.work.push(item);}
                        });

                        model.user_custom = [];
                        docs[0].user_custom.forEach(function(item){
                            if(item.visible == true){model.user_custom.push(item);}
                        });

                        data.model = model;
                    }
                }
                else{
                    //검색 결과 없음
                    result = 221;
                }
                data.result = result;
                res.json(data);
                return;
            }
        });
};


var careerObjectEmptyCheck = function(value, index, ar){

    var checkVar = true;

    if(value.name == ''){
        checkVar = false;
    }
    else if(value.type == 'file'){
        console.log(util.inspect(value));
        console.log(typeof value.attribute);
        if(typeof value.attribute === "undefined"){
            checkVar = false;
        }
    }
    else{
        for (var key in value.attribute){
            if(value.attribute[key] == ''){
                checkVar = false;
                break;
            }
        }
    }

    console.log(checkVar);
    return checkVar;
}


exports.postCareer = function(req, res){
    var result = 999;
    var data = {};

    var careerData = req.body;

    //포트폴리오 이름이 있나 체크한다
    if(careerData.portfolioName == ''){
        result = 302;
        data.result = result;
        res.json(data);
        return;
    }

    //템플릿이 하나도 없을 때 304
    if(typeof careerData.templates == "undefined"){
        result = 304;
        data.result = result;
        res.json(data);
        return;
    }

    //항목이 모두 채워져있나 체크해 비어있으면 302
    if(!(careerData.templates.every(careerObjectEmptyCheck))){
        result = 302;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scUser.findOne({_id:req.user._id})
    .exec(function(err, doc){
        if(err){
            result = 303;
            data.result = result;
            res.json(data);
        }
        else{
            var successFlag = false;
            doc.categoryList.forEach(function(category, index){
                if(category.name == careerData.category){
                    var templateList = [];
                    careerData.templates.forEach(function(templateItem, index){
                        templateList.push(new schema.scTemplete({
                            order:index,
                            name:templateItem.name,
                            type:templateItem.type,
                            attribute:templateItem.attribute
                        }));
                    });

                    var newPortfolio = new schema.scCareer({
                        name: careerData.portfolioName,
                        category: careerData.category,
                        templateList:templateList
                    });

                    category.careerList.push(newPortfolio);
                    doc.save();

                    successFlag = true;
                }
            });

            //결과 처리
            if(successFlag == true){
                result = 300;
            }
            else{
                result = 303;
            }
            data.result = result;
            res.json(data);
            return;
        }
    });
};

exports.modificationCareer = function(req, res){
    var result = 999;
    var data = {};

    var careerData = req.body;
    var career_id = req.params.career;

    console.log('req body');
    console.log(util.inspect(req.body));

    //포트폴리오 이름이 있나 체크한다
    if(careerData.portfolioName == ''){
        result = 312;
        data.result = result;
        res.json(data);
        return;
    }

    //템플릿이 하나도 없을 때 304
    if(typeof careerData.templates == "undefined"){
        result = 314;
        data.result = result;
        res.json(data);
        return;
    }

    //항목이 모두 채워져있나 체크해 비어있으면 302
    if(!(careerData.templates.every(careerObjectEmptyCheck))){
        result = 312;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scUser.findOne({_id:req.user._id})
        .exec(function(err, doc){
            if(err){
                result = 313;
                data.result = result;
                res.json(data);
            }
            else{
                var successFlag = false;

                //기존 삭제
                doc.categoryList.forEach(function(category, index){
                    category.careerList.forEach(function(careerItem, index){
                        if(careerItem._id == career_id){
                            category.careerList.splice(index, 1);
                            //doc.save();
                        }
                    });
                });

                doc.categoryList.forEach(function(category, index){
                    if(category.name == careerData.category){
                        //새로 등록
                        var templateList = [];
                        careerData.templates.forEach(function(templateItem, index){

                            if(templateItem.type == 'file'){
                                console.log(util.inspect(templateItem.attribute));
                            }

                            templateList.push(new schema.scTemplete({
                                order:index,
                                name:templateItem.name,
                                type:templateItem.type,
                                attribute:templateItem.attribute
                            }));
                        });

                        var newPortfolio = new schema.scCareer({
                            name: careerData.portfolioName,
                            category: careerData.category,
                            templateList:templateList
                        });

                        category.careerList.push(newPortfolio);
                        doc.save();
                        successFlag = true;
                    }
                });

                //결과 처리
                if(successFlag == true){
                    result = 310;
                }
                else{
                    result = 313;
                }
                data.result = result;
                res.json(data);
                return;
            }
        });
};

exports.changeUserConfig = function(req, res){
    var result = 999;
    var data = {};

    console.log(util.inspect(req.body));

    var user = req.user;
    var category = req.body.category;
    var addCategory = req.body.addCategory;
    var delCategory = req.body.delCategory;

    var filePath = "";
    if(req.body.filePath != ""){
        filePath = '/uploads/' + user._id + '/' + req.body.filePath;
    }

    if((category.length + addCategory.length) > 9){
        result = 501;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scUser.findOne({_id:user._id})
    .exec(
        function(err, doc){
            if(err){
                result = 503;
                data.result = result;
                res.json(data);
            }
            else{
                //introduceUrl 변경
                if(filePath != ""){
                    doc.introduceUrl = filePath;
                }

                //Category 삭제처리
                if(delCategory.length > 0){
                    delCategory.forEach(function(item, idx){
                        doc.categoryList.forEach(function(categoryItem, idx){
                            if(categoryItem.name == item){
                                doc.categoryList.splice(idx, 1);
                            }
                        });
                    });
                }

                //Category 이름 변경처리
                if(category.length > 0){
                    category.forEach(function(item, idx){
                        //변경된 이름이 있다면 변경처리
                        if(item.after != ''){
                            doc.categoryList.forEach(function(categoryItem, idx){
                                if(categoryItem.name == item.before){
                                    categoryItem.name = item.after;
                                }
                            });
                        }
                    });
                }

                //Category 추가처리
                if(addCategory.length > 0){
                    addCategory.forEach(function(item, idx){
                        doc.categoryList.push(
                            new schema.scCategory({
                                name: item,
                                description: '추가된 카테고리 입니다'
                            })
                        )
                    });
                }

                //save
                doc.save();

                //성공 처리
                result = 500;
                data.result = result;
                res.json(data);
            }
        }
    );
};

//Delete Api Implement
exports.exitUser = function(req, res){
    var data = {};
    var result = 999;
    var inputUserId = req.params.user;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    schema.scUser.remove({_id:inputUserId}).exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
        }
        else{
            if(docs > 0){
                result = 230;
                req.logout();
                res.clearCookie('authcode');
                res.clearCookie('SESSION');
            }
            else{
                result = 231;
            }
            data.result = result;
            res.json(data);
        }
    });
};