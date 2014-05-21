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

mongoose.connect('mongodb://54.178.136.239:27017/test', optionsServer);   //Server Connect
//mongoose.connect('mongodb://localhost:27017/test', optionsServer);             //Local Connect
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
    res.json({"result":110});
};


exports.postCareer = function(req, res){
    var result = 999;
    var data = {};


}

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
    var userEmail = bodyData.email;
    var userName = bodyData.name;
    var userBirth = bodyData.birth;

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
                    birth:userBirth
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
    if(areEmpty([bodyData.name, bodyData.birth, bodyData.sex, bodyData.email]))
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

//Activity Api Implement
exports.addActivity = function(req, res){
    var data = {};
    var result = 999;
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    var bodyData = req.body;
    if(areEmpty([bodyData.user_id, bodyData.visible, bodyData.title, bodyData.start_date, bodyData.category]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    var userId = bodyData.user_id;
    var userVisible = bodyData.visible;
    var userTitle = bodyData.title;
    var userStartDate = Date.parse(bodyData.start_date);
    var userCategory = bodyData.category;

    var userEndDate = null;
    if(!isEmpty(bodyData.end_date)){
        userEndDate = Date.parse(bodyData.end_date);
    }
    var userInfo = null;
    if(!isEmpty(bodyData.info)){
        userInfo = bodyData.info;
    }
    var userArticle = null;
    if(!isEmpty(bodyData.article)){
        userArticle = bodyData.article;
    }
    var userFile = null;
    if(!isEmpty(bodyData.file)){
        userFile = bodyData.file;
    }
    var userMemo = null;
    if(!isEmpty(bodyData.memo)){
        userMemo = bodyData.memo;
    }

    new schema.scActivity({
        user_id: userId,
        visible: userVisible,
        title: userTitle,
        category: userCategory,
        start_date: userStartDate,
        end_date: userEndDate,
        info: userInfo,
        article: userArticle,
        file: userFile,
        memo: userMemo
    }).save(function(err, docs){
            if(err){
                result = 780;
            }
            else{
                result = 300;
            }
            data.result = result;
            res.json(data);
            return;
        });
};

exports.getUserListActivity = function(req, res){
    var result = 999;
    var data = {};
    var list = [];

    var inputUserId = req.params.user;
    if(isEmpty(inputUserId)){
        data.result = 888;
        res.json(data);
        return;
    }

    var query = schema.scActivity.where('user_id').equals(inputUserId);

    //조회하는사람이 작성한 유저가 아니라면 visible = true조건을 추가해준다.
    if(isEmpty(req.user)){
        query.where('visible').equals(true);
    }
    else if(req.user._id != inputUserId){
        query.where('visible').equals(true);
    }

    query.exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            if(docs.length > 0){
                docs.forEach(function(doc){
                    //검색된 각각의 doc에 대해
                    var docData = {};
                    docData._id = doc._id;
                    docData.category = doc.category;
                    docData.title = doc.title;
                    docData.start_date = doc.start_date.getyyyymmdd();

                    if(isLengthZero(doc.end_date)){
                        docData.end_date = doc.end_date;
                    }
                    else{
                        docData.end_date = doc.end_date.getyyyymmdd();
                    }

                    docData.visible = doc.visible;

                    list.push(docData);
                });

                result = 310;
                data.result = result;
                data.model = list;
                res.json(data);
                return;
            }
            else{
                result = 311;
                data.result = result;
                res.json(data);
                return;
            }
        }
    });
};

exports.getActivity = function(req, res){
    var result = 999;
    var data = {};

    var inputActivityId = req.params.act;
    if(isEmpty(inputActivityId)){
        result = 888;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scActivity.where('_id').equals(inputActivityId).exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            if(docs.length > 0){
                //검색성공
                //공개일 경우
                if(docs[0].visible == true){
                    result = 320;
                    var activity = {};
                    activity._id = docs[0]._id;
                    activity.user_id = docs[0].user_id;
                    activity.title = docs[0].title;
                    activity.visible = docs[0].visible;
                    activity.category = docs[0].category;
                    activity.start_date = docs[0].start_date.getyyyymmdd();

                    if(isLengthZero(docs[0].end_date)){
                        activity.end_date = docs[0].end_date;
                    }
                    else{
                        activity.end_date = docs[0].end_date.getyyyymmdd();
                    }

                    activity.info = docs[0].info;
                    activity.article = docs[0].article;
                    activity.file = docs[0].file;
                    activity.memo = docs[0].memo;
                    data.model = activity;
                }
                else{
                    //비공개일 경우
                    //로그인 안 한 경우
                    if(isEmpty(req.user)){
                        result = 668;
                    }
                    //로그인 하고, 본인인 경우
                    else if(req.user._id == docs[0].user_id){
                        result = 320;
                        var activity = {};
                        activity._id = docs[0]._id;
                        activity.user_id = docs[0].user_id;
                        activity.title = docs[0].title;
                        activity.visible = docs[0].visible;
                        activity.category = docs[0].category;
                        activity.start_date = docs[0].start_date.getyyyymmdd();

                        if(isLengthZero(docs[0].end_date)){
                            activity.end_date = docs[0].end_date;
                        }
                        else{
                            activity.end_date = docs[0].end_date.getyyyymmdd();
                        }

                        activity.info = docs[0].info;
                        activity.article = docs[0].article;
                        activity.file = docs[0].file;
                        activity.memo = docs[0].memo;
                        data.model = activity;
                    }
                    //본인
                    else{
                        //로그인 했으나 본인이 아닌 경우 또는 그 외
                        result = 668;
                    }
                }
            }
            else{
                //검색결과없음
                result = 321;
            }

            data.result = result;
            res.json(data);
            return;
        }
    });
};

exports.editActivity = function(req, res){
    var result = 999;
    var data = {};
    var inputActivityId = req.params.act;
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    if(areEmpty([req.body.user_id, req.body.category, req.body.visible,
        req.body.title, req.body.start_date]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    if(!isEmpty(req.body._id)){
        delete req.body._id;
    }

    schema.scActivity.update(
        {_id:inputActivityId, user_id:inputUserId},
        req.body,
        function(err, docs){
            if(err){
                //쿼리에러
                result = 780;
            }
            else{
                if(docs > 0){
                    //성공
                    result = 330;
                }
                else{
                    //해당 활동 없음
                    result = 331;
                }
            }

            data.result = result;
            res.json(data);
            return;
        }
    );
};

//Resume Api Implement
exports.addResume = function(req, res){
    var result = 999;
    var data = {};
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    var bodyData = req.body;
    if(areEmpty([inputUserId, bodyData.visible, bodyData.title, bodyData.body, bodyData.submit]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    var inputVisible = bodyData.visible;
    var inputTitle = bodyData.title;
    var inputBody = bodyData.body;
    var inputSubmit = bodyData.submit;

    new schema.scResume({
        user_id: inputUserId,
        visible: inputVisible,
        title: inputTitle,
        submit:inputSubmit,
        body: inputBody
    }).save(function(err, docs){
            if(err){
                //Error
                result = 780;
            }
            else{
                result = 400;
            }
            data.result = result;
            res.json(data);
            return;
        });
};

exports.getUserListResume = function(req, res){
    var result = 999;
    var data = {};
    var list = [];

    var inputUserId = req.params.user;
    if(isEmpty(inputUserId)){
        data.result = 888;
        res.json(data);
        return;
    }

    var query = schema.scResume.where('user_id').equals(inputUserId);

    //조회하는사람이 작성한 유저가 아니라면 visible = true조건을 추가해준다.
    if(isEmpty(req.user)){
        query.where('visible').equals(true);
    }
    else if(req.user._id != inputUserId){
        query.where('visible').equals(true);
    }

    query.select('_id title submit body visible')
        .exec(function(err, docs){
            if(err){
                result = 780;
                data.result = result;
                res.json(data);
                return;
            }
            else{
                if(docs.length > 0){
                    docs.forEach(function(doc){
                        //검색된 각각의 doc에 대해
                        //자소서의 body항목의 개수를 같이 합쳐서 return해 줌
                        var docData = {};
                        docData._id = doc._id;
                        docData.title = doc.title;

                        if(isLengthZero(doc.submit.time)){
                            docData.submit = doc.submit;
                        }
                        else{
                            docData.submit = {};
                            docData.submit.time = doc.submit.time.getyyyymmdd();
                            docData.submit.check = doc.submit.check;
                        }


                        docData.bodyLength = doc.body.length;
                        docData.visible = doc.visible;
                        list.push(docData);
                    });

                    result = 410;
                    data.result = result;
                    data.model = list;
                    res.json(data);
                    return;
                }
                else{
                    result = 411;
                    data.result = result;
                    res.json(data);
                    return;
                }
            }
        });
};

exports.getResume = function(req, res){
    var result = 999;
    var data = {};
    var model = {};

    var inputResumeId = req.params.res;
    if(isEmpty(inputResumeId)){
        result = 888;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scResume.where('_id').equals(inputResumeId).exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            if(docs.length > 0){
                //검색성공
                //공개일 때
                if(docs[0].visible == true){
                    result = 620;
                    model.user_id = docs[0].user_id;
                    model.visible = docs[0].visible;
                    model.title = docs[0].title;
                    model._id = docs[0]._id;
                    model.body = docs[0].body;

                    if(isLengthZero(docs[0].submit.time)){
                        model.submit = docs[0].submit;
                    }
                    else{
                        model.submit = {};
                        model.submit.time = docs[0].submit.time.getyyyymmdd();
                        model.submit.check = docs[0].submit.check;
                    }

                    data.model = model;
                    //data.model = docs[0];
                }
                else{
                    //로그인 안함
                    if(isEmpty(req.user)){
                        result = 668;
                    }
                    //로그인 했고, 본인인 경우
                    else if(req.user._id == docs[0].user_id){
                        result = 620;
                        model.user_id = docs[0].user_id;
                        model.visible = docs[0].visible;
                        model.title = docs[0].title;
                        model._id = docs[0]._id;
                        model.body = docs[0].body;

                        if(isLengthZero(docs[0].submit.time)){
                            model.submit = docs[0].submit;
                        }
                        else{
                            model.submit = {};
                            model.submit.time = docs[0].submit.time.getyyyymmdd();
                            model.submit.check = docs[0].submit.check;
                        }

                        data.model = model;
                    }
                    //로그인 했으나 본인이 아닌 경우
                    else{
                        result = 668;
                    }
                }
            }
            else{
                //검색결과없음
                result = 621;
            }

            data.result = result;
            res.json(data);
            return;
        }
    });
};

exports.editResume = function(req, res){
    var result = 999;
    var data = {};
    var inputResumeId = req.params.res;
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    if(areEmpty([req.body.visible, req.body.title,
        req.body.body, req.body.submit]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    //통째로 넣을 때 있으면 안되는 정보들 제거
    if(!isEmpty(req.body._id)){
        delete req.body._id;
    }
    if(!isEmpty(req.body.user_id)){
        delete req.body.user_id;
    }

    schema.scResume.update(
        {_id:inputResumeId, user_id:inputUserId},
        req.body,
        function(err, docs){
            if(err){
                //쿼리에러
                result = 780;
            }
            else{
                if(docs > 0){
                    //성공
                    result = 630;
                }
                else{
                    //해당 자소서 없음
                    result = 631;
                }
            }

            data.result = result;
            res.json(data);
            return;
        }
    );
};

//Event Api Implement
exports.addEvent = function(req, res){
    var result = 999;
    var data = {};
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    var bodyData = req.body;
    if(areEmpty([inputUserId, bodyData.visible, bodyData.title, bodyData.category, bodyData.date]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    var inputVisible = bodyData.visible;
    var inputTitle = bodyData.title;
    var inputCategory = bodyData.category;
    var inputDate = bodyData.date;

    var inputMemo = null;
    if(!isEmpty(bodyData.memo)){
        inputMemo = bodyData.memo;
    }

    new schema.scEvent({
        user_id: inputUserId,
        title: inputTitle,
        visible: inputVisible,
        category: inputCategory,
        date: inputDate,
        memo: inputMemo
    }).save(function(err, docs){
            if(err){
                result = 780;
            }
            else{
                result = 600;
            }
            data.result = result;
            res.json(data);
            return;
        });
};

exports.getUserListEvent = function(req, res){
    var result = 999;
    var data = {};
    var list = [];

    var inputUserId = req.params.user;
    if(isEmpty(inputUserId)){
        data.result = 888;
        res.json(data);
        return;
    }

    var query = schema.scEvent.where('user_id').equals(inputUserId);

    //조회하는사람이 작성한 유저가 아니라면 visible = true조건을 추가해준다.
    if(isEmpty(req.user)){
        query.where('visible').equals(true);
    }
    else if(req.user._id != inputUserId){
        query.where('visible').equals(true);
    }
    else{}

    query.exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            if(docs.length > 0){
                docs.forEach(function(doc){
                    //검색된 각각의 doc에 대해
                    var docData = {};
                    docData._id = doc._id;
                    docData.category = doc.category;
                    docData.title = doc.title;
                    docData.date = doc.date.getKoreaDate();
                    docData.visible = doc.visible;
                    docData.memo = doc.memo;

                    list.push(docData);
                });

                result = 610;
                data.result = result;
                data.model = list;
                res.json(data);
                return;
            }
            else{
                result = 611;
                data.result = result;
                res.json(data);
                return;
            }
        }
    });
};

exports.getEvent = function(req, res){
    var result = 999;
    var data = {};
    var model = {};

    var inputEventId = req.params.event;
    if(isEmpty(inputEventId)){
        result = 888;
        data.result = result;
        res.json(data);
        return;
    }

    schema.scEvent.where('_id').equals(inputEventId).exec(function(err, docs){
        if(err){
            result = 780;
            data.result = result;
            res.json(data);
            return;
        }
        else{
            //검색 성공
            if(docs.length > 0){
                //공개일 때
                if(docs[0].visible == true){
                    result = 620;
                    model._id = docs[0]._id;
                    model.user_id = docs[0].user_id;
                    model.title = docs[0].title;
                    model.visible = docs[0].visible;
                    model.category = docs[0].category;
                    model.date = docs[0].date.getKoreaDate();
                    model.memo = docs[0].memo;
                    data.model = model;
                }
                //비공개일 때
                else{
                    //비로그인 상태
                    if(isEmpty(req.user)){
                        result = 668;
                    }
                    //로그인 상태이고, 본인일 때
                    else if(req.user._id == docs[0].user_id){
                        result = 620;
                        model._id = docs[0]._id;
                        model.user_id = docs[0].user_id;
                        model.title = docs[0].title;
                        model.visible = docs[0].visible;
                        model.category = docs[0].category;
                        model.date = docs[0].date.getKoreaDate();
                        model.memo = docs[0].memo;
                        data.model = model;
                    }
                    //로그인 상태이나 본인이 아닐 때 또는 그 외
                    else{
                        result = 668;
                    }
                }
            }
            else{
                result = 621;
            }

            data.result = result;
            res.json(data);
            return;
        }
    });
};

exports.editEvent = function(req, res){
    var result = 999;
    var data = {};
    var inputEventId = req.params.event;
    var inputUserId = req.body.user_id;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    //필수 data Validate. 없으면 888
    if(areEmpty([req.body.visible, req.body.title,
        req.body.category, req.body.date]))
    {
        data.result = 888;
        res.json(data);
        return;
    }

    //있으면 안되는 정보들 제거
    if(!isEmpty(req.body._id)){
        delete req.body._id;
    }
    if(!isEmpty(req.body.user_id)){
        delete req.body.user_id;
    }

    schema.scEvent.update(
        {_id:inputEventId, user_id:inputUserId},
        req.body,
        function(err, docs){
            if(err){
                //쿼리에러
                result = 780;
            }
            else{
                if(docs > 0){
                    //성공
                    result = 630;
                }
                else{
                    //해당 자소서 없음
                    result = 631;
                }
            }

            data.result = result;
            res.json(data);
            return;
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

exports.delActivity = function(req, res){
    var data = {};
    var result = 999;
    var inputUserId = req.body.user_id;
    var inputActivityId = req.params.act;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    schema.scActivity.remove({_id:inputActivityId}, {user_id:inputUserId}).exec(function(err, docs){
        if(err){
            //쿼리에러
            result = 780;
            data.result = result;
            res.json(data);
        }
        else{
            if(docs > 0){
                //정상삭제
                result = 340;
            }
            else{
                //맞는 정보 없을 때
                result = 341;
            }
            data.result = result
            res.json(data);
        }
    });
};

exports.delResume = function(req, res){
    var data = {};
    var result = 999;
    var inputUserId = req.body.user_id;
    var inputResumeId = req.params.res;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    schema.scResume.remove({_id:inputResumeId}, {user_id:inputUserId}).exec(function(err, docs){
        if(err){
            //쿼리에러
            result = 780;
            data.result = result;
            res.json(data);
        }
        else{
            if(docs > 0){
                //정상삭제
                result = 450;
            }
            else{
                //맞는 정보 없을 때
                result = 451;
            }
            data.result = result
            res.json(data);
        }
    });
};

exports.delEvent = function(req, res){
    var data = {};
    var result = 999;
    var inputUserId = req.body.user_id;
    var inputEventId = req.params.event;

    if(req.user._id != inputUserId){
        result = 667;
        data.result = result;
        res.json(data);
    }

    schema.scEvent.remove({_id:inputEventId}, {user_id:inputUserId}).exec(function(err, docs){
        if(err){
            //쿼리에러
            result = 780;
            data.result = result;
            res.json(data);
        }
        else{
            if(docs > 0){
                //정상삭제
                result = 640;
            }
            else{
                //맞는 정보 없을 때
                result = 641;
            }
            data.result = result
            res.json(data);
        }
    });
};

//External Api Implement
exports.getTimelineData = function(req, res){
    var result = 999;
    var data = {};

    async.waterfall([

    ]);
};

//Disuse Api Implement
exports.getActivityTemplate = function(req, res){
    var result = 999;
    var data = {};

    var inputTemplateText = req.params.text;
    if(isEmpty(inputTemplateText)){
        data.result = 888;
        res.json(data);
        return;
    }

    schema.scActivityTemplete.where('category').equals(inputTemplateText)
        .exec(function(err, docs){
            if(err){
                result = 780;
                data.result = result;
                res.json(data);
                return;
            }
            else{
                if(docs.length > 0){
                    result = 500;
                    data.model = docs[0];
                }
                else{
                    result = 501;
                }
                data.result = result;
                res.json(data);
                return;
            }
        });
};

exports.setRepresentActivity = function(req, res){
    var result = 999;
    var data = {};
    var inputActivityId = req.params.act;
    var inputUserId = req.body.user_id;

    async.waterfall(
        [
            //Activity Schema에서 찾고, 유저가 맞는지 비교한다.
            function(callback){
                schema.scActivity.findOne({_id:inputActivityId}).select('user_id')
                    .exec(
                    function(err, doc){
                        if(err){
                            result = 780;
                            callback(err);
                            return;
                        }
                        else{
                            if(doc){
                                if(doc.user_id == inputUserId){
                                    //일단 1단계 성공. 글쓴이와 유저가 같다. 다음 단계로
                                    callback(null, true);
                                    return;
                                }
                                else{
                                    //글쓴이와 요청 유저가 다르다.
                                    result = 702;
                                    callback(null, false);
                                    return;
                                }
                            }
                            else{
                                //활동을 찾지 못했다.
                                result = 701;
                                callback(null, false);
                            }
                        }
                    });
            },

            //있고 유저도 같다면 User Schema에 대표 항목을 update한다.
            function(searchResult, callback){
                //위에서 내려온 결과가 false라면 할 필요 없음
                if(searchResult == false){
                    callback(null);
                    return;
                }

                schema.scUser.update(
                    {_id:inputUserId},
                    {represent_activity:ObjectId(inputActivityId)},
                    function(err, docs){
                        if(err){
                            //쿼리 에러
                            result = 780;
                            callback(err);
                            return;
                        }
                        else{
                            //성공!
                            result = 700;
                            callback(null);
                            err;
                        }
                    }
                );
            }
        ],

        //맨 마지막 처리
        function(err){
            data.result = result;
            res.json(data);
            return;
        }
    );
};

exports.setRepresentResume = function(req, res){
    var result = 999;
    var data = {};
    var inputResumeId = req.params.res;
    var inputUserId = req.body.user_id;

    async.waterfall(
        [
            //Activity Schema에서 찾고, 유저가 맞는지 비교한다.
            function(callback){
                schema.scResume.findOne({_id:inputResumeId}).select('user_id')
                    .exec(
                    function(err, doc){
                        if(err){
                            result = 780;
                            callback(err);
                            return;
                        }
                        else{
                            if(doc){
                                if(doc.user_id == inputUserId){
                                    //일단 1단계 성공. 글쓴이와 유저가 같다. 다음 단계로
                                    callback(null, true);
                                    return;
                                }
                                else{
                                    //글쓴이와 요청 유저가 다르다.
                                    result = 712;
                                    callback(null, false);
                                    return;
                                }
                            }
                            else{
                                //자기소개서를 찾지 못했다.
                                result = 711;
                                callback(null, false);
                            }
                        }
                    });
            },

            //있고 유저도 같다면 User Schema에 대표 항목을 update한다.
            function(searchResult, callback){
                //위에서 내려온 결과가 false라면 할 필요 없음
                if(searchResult == false){
                    callback(null);
                    return;
                }

                schema.scUser.update(
                    {_id:inputUserId},
                    {represent_resume:ObjectId(inputResumeId)},
                    function(err, docs){
                        if(err){
                            //쿼리 에러
                            result = 780;
                            callback(err);
                            return;
                        }
                        else{
                            //성공!
                            result = 710;
                            callback(null);
                            err;
                        }
                    }
                );
            }
        ],

        //맨 마지막 처리
        function(err){
            data.result = result;
            res.json(data);
            return;
        }
    );
};