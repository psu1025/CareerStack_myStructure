/*
 * Author: Aristein
 * Create Date: 14. 05. 10
 * Project Name: Career Stack
 * Version: 0.1.0
 * Filename: app.js
 * Detail: 프로그램의 시작
 */

////////////////////////////////////////////////
//Load Module
////////////////////////////////////////////////
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var upload = require('jquery-file-upload-middleware');
var app = express();

var crypto = require('crypto'),
    util = require('util'),
    LocalStrategy = require('passport-local').Strategy,
    passport = require('passport'),
    uuid = require('node-uuid');

var schema = require('./routes/schema.js');
var view = require('./routes/viewRoute.js');

////////////////////////////////////////////////
//Server Configuration
////////////////////////////////////////////////

//Javascript CrossDomain 해결
var allowCrossDomain = function(req, res, next){
    res.header('Access-Control-Allow-Credentials', true);
    //Ajax CrossDomain때문에 고통많이받음. 특히 세션이 사라지는 현상을 보였음.
    res.header('Access-Control-Allow-Origin', req.header.origin);//'http://localhost:80, http://54.178.136.239:80');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, HEAD, GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'user_id, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, *');

    if(req.method == 'OPTIONS'){
        res.send(200);
    }
    else{
        next();
    }
};

//Upload Configuration
upload.configure({
    imageVersions:{
        thumbnail:{
            width:128,
            height:128
        }
    },
    tmpDir: __dirname + '/uploads',
    maxPostSize: 1024*1024*50,
    maxFileSize: 1024*1024*20,
    minFileSize: 1,
    acceptFileTypes: /.+/i,
    imageTypes: /\.(gif|jpe?g|png)$/i,
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE'
    }
});

////////////////////////////////////////////////
//Passport (Session) Configuration
////////////////////////////////////////////////
function findById(id, callback){
    schema.scUser.findOne({_id:id}).exec(function(err, docs){
        if(err){
            callback(err);
        }
        else{
            if(docs){
                var user = {
                    "_id":          id,
                    "email":        docs.email,
                    "name":         docs.name,
                    "birth":        docs.birth,
                    "authcode":     docs.auth_code,
                    "hashPassword": docs.hashPassword,
                    "salt":         docs.salt
                };
                callback(null, user);
            }
            else{
                callback(new Error('user not exist'));
            }
        }
    });
};

function findByEmail(email, callback){
    schema.scUser.findOne({"email":email}).exec(function(err, docs){
        if(err){
            return callback(err);
        }
        else{
            if(docs){
                var user = {
                    "_id":          docs._id,
                    "email":        email,
                    "name":         docs.name,
                    "birth":        docs.birth,
                    "authcode":     docs.auth_code,
                    "hashPassword": docs.hashPassword,
                    "salt":         docs.salt
                };
                return callback(null, user);
            }
            else{
                return callback(null,  null);
            }
        }
    });
};

function ensureAuthenticatedBan(req, res, next){
    console.log(req.user);
    console.log(req.cookies);
    console.log(req.isAuthenticated());
    if(req.cookies.authcode && req.user &&
        (req.cookies.authcode === req.user.authcode) && req.isAuthenticated()){
        //인증이 되어있으면 통과
        req.ensureAuth = true;
        return next();
    }
    else{
        //안 되어있으면 메인 페이지로 리다이렉션
        req.logout();
        res.redirect('/view/main');
        return;
    }
};

function ensureAuthenticatedRedirectionToMypage(req, res, next){
    if(req.cookies.authcode && req.user &&
        (req.cookies.authcode === req.user.authcode) && req.isAuthenticated()){
        //인증이 되어 있으면 마이페이지로 리다이렉션
        req.ensureAuth = true;
        res.redirect('/view/mypage');
        return;
    }
    else{
        //안 되어 있으면 그대로
        req.ensureAuth = false;
        return next();
    }
};

function ensureAuthenticatedBranch(req, res, next){
    if(req.cookies.authcode && req.user &&
        (req.cookies.authcode === req.user.authcode) && req.isAuthenticated()){
        req.ensureAuth = true;
        return next();
    }
    else{
        req.ensureAuth = false;
        return next();
    }
};


passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    findById(id,  function(err, user){
        done(err, user);
    })
});

passport.use(new LocalStrategy(
    function(email, password, done){
        findByEmail(email, function(err, user){
            if(err){ return done(err); }
            if(!user){ return done(null, false, {"result":101}); }

            var hashPassword = crypto.createHash('sha512').update(user.salt + password).digest('hex');
            if(user.hashPassword != hashPassword){
                return done(null, false, {"result":102});
            }

            return done(null, user);
        });
    }
));

////////////////////////////////////////////////
//Environments Set
////////////////////////////////////////////////
app.set('port', process.env.PORT || 80);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(allowCrossDomain);

// 로그
// 포맷 (접속 IP - 처리 결과 [날짜(GMT)] 응답시간 요청크기 메소드 접근url 유저정보)
app.use(express.logger({
    format: ':remote-addr - :status [:date] :response-time ms :res[content-length] " :method :url " ":user-agent"'
}));
//압축
app.use(express.compress());              //리퀘스트 압축



app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());

app.use(express.session({secret:'dlrjsqlalfqjsgh'}));
app.use(passport.initialize());
app.use(passport.session());

//upload 체크
app.use('/upload', function(req, res, next){
    console.log(util.inspect(req.user));
    upload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + req.user._id;
        },
        uploadUrl: function(){
            return '/uploads/';+ req.user._id;
        }
    })(req, res, next);
});

app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//잘못 된 경로로 들어왔을 때. 하단에 '*' 처리 한 부분이 동일 결과임.
var JADE_PATH = __dirname + '/views/';
app.use(function(req, res, next){
    var data = {};

    //res.status(404).json(data);
    if(res.status(404)){
//        data.result = 777;
//        res.json(data);
        res.render(JADE_PATH+'error.jade');
    }
    else{
        next();
    }
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

////////////////////////////////////////////////
//API Set
////////////////////////////////////////////////
//Input API
app.get('/api/initial', routes.initial);

//passport를 이용한 login
app.post('/api/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info){
        if(err){
            return next(err);
        }
        if(!user){
            //위에서 정의한 passport.use에서 받은 데이터를 가지고 유저에게 리턴해 줌
            return res.json(info);
        }
        req.logIn(user, function(err){
            if(err){
                return next(err);
            }

            var authcode = uuid.v1();
            schema.scUser.update({_id:user._id}, {auth_code:authcode}, function(err, docs){
                res.cookie("authcode", authcode,  {maxAge: 1*60*60*1000});
                console.log(req.user);
                console.log(req.cookies);
                console.log(req.isAuthenticated());
                return res.json({"result":100, "model":user._id});
            });

        });
    })(req, res, next);
});

app.get('/api/logout', routes.logout);

//User API
app.post('/api/user', routes.signUser);
app.delete('/api/user/:user');
app.get('/api/user/:user');
app.put('/api/user/:user');

//Career API
app.post('/api/career');
app.delete('/api/career/:career');
app.put('/api/career/:career');
app.get('/api/career/:career')
app.get('/api/list/career/:user');

//Template API
app.get('/api/template/:template');     //정해진 Template 양식 받기

app.post('/api/template');
app.delete('/api/template/:template');
app.put('/api/template/:template');

//Config API
app.post('/api/config/submit', ensureAuthenticatedBan, routes.changeUserConfig);

//Upload API

//Test API
app.post('/test', routes.test);

////////////////////////////////////////////////
//View Route Set
////////////////////////////////////////////////
app.get('/', function(req, res){
    res.redirect('/view/main');
});

app.get('/view/main', ensureAuthenticatedRedirectionToMypage, view.viewMain);
app.get('/view/mypage', ensureAuthenticatedBan, view.viewMyPage);

app.get('/view/join', ensureAuthenticatedRedirectionToMypage, view.viewJoin);
app.get('/view/careerList/:category', ensureAuthenticatedBan, view.viewCareerList);

app.get('/view/career/selectTemplate', ensureAuthenticatedBan, view.selectTemplate);
app.get('/view/career/write/:template', ensureAuthenticatedBan, view.writeCareer);

app.get('/view/setting', ensureAuthenticatedBan, view.setting);

app.get('/view/career/edit/:career');
app.post('/view/career/edit/:career');

app.get('/view/maptest', view.mapTest);
app.get('/view/testjade', view.testJade);



////User API
//app.post('/user', ensureAuthenticatedBranch, routes.signUser);
//app.get('/user/:user', ensureAuthenticatedBranch, routes.getUserInfo);
//app.put('/user/:user', ensureAuthenticatedBan, routes.editUserInfo);
//app.del('/user/:user', ensureAuthenticatedBan, routes.exitUser);
//
////Activity API
//app.post('/activity', ensureAuthenticatedBan, routes.addActivity);
//app.get('/activity/list/:user', ensureAuthenticatedBranch, routes.getUserListActivity);
//app.get('/activity/:act', ensureAuthenticatedBranch, routes.getActivity);
//app.put('/activity/:act', ensureAuthenticatedBan, routes.editActivity);
//app.del('/activity/:act', ensureAuthenticatedBan, routes.delActivity);
//
////Resume API
//app.post('/resume', ensureAuthenticatedBan, routes.addResume);
//app.get('/resume/list/:user', ensureAuthenticatedBranch, routes.getUserListResume);
//app.get('/resume/:res', ensureAuthenticatedBranch, routes.getResume);
//app.put('/resume/:res', ensureAuthenticatedBan, routes.editResume);
//app.del('/resume/:res', ensureAuthenticatedBan, routes.delResume);
//
////Event API
//app.post('/event', ensureAuthenticatedBan, routes.addEvent);
//app.get('/event/list/:user', ensureAuthenticatedBranch, routes.getUserListEvent);
//app.get('/event/:event', ensureAuthenticatedBranch, routes.getEvent);
//app.put('/event/:event', ensureAuthenticatedBan, routes.editEvent);
//app.del('/event/:event', ensureAuthenticatedBan, routes.delEvent);
//
//
////get Template API
//app.get('/template/activity/:text', routes.getActivityTemplate);

/////////////////////////////////////
////////////////////////////////////////////////
//Server Start
////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});