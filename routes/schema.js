////////////////////////////////////////////////
//Mongoose Definition
////////////////////////////////////////////////
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  MixedType = Schema.Types.Mixed;



////////////////////////////////////////////////
//CareerStack Schema
////////////////////////////////////////////////

var testSchema = mongoose.Schema({
    test:{type:MixedType, default:null},
    test2:{type:MixedType, default:null}
});

var fileSchema = mongoose.Schema({
    name:String,
    originalName:String,
    size:Number,
    type:String,
    deleteType:String,
    url:String,
    deleteUrl:String,
    thumbnailUrl:{type:String, default:null}
});

var templateSchema = mongoose.Schema({
    order:Number,
    name:String,
    type:String,

    attribute: MixedType
});

var careerSchema = mongoose.Schema({
    name: String,

    category: String,

    templateList: [templateSchema],

    write_time:{type:Date, default:Date.now},
    edit_time:{type:Date,default:null}
});

var categorySchema = mongoose.Schema({
    name:String,
    description:String,
    careerList:[careerSchema]
});

var userSchema = mongoose.Schema({
    //필수항목
    email: String,
    hashPassword: String,
    salt: String,
    name: String,
    birth: Date,

    //////////////////////////////////////////////
    //내부 구조
    //////////////////////////////////////////////
    //자기소개 Flipboard에 들어간 이미지 URL
    introduceUrl: {type:String, default: "/resource/images/mypage/introduce_default.png"},

    //유저의 카테고리 리스트
    categoryList:[categorySchema],
    //////////////////////////////////////////////

    //시스템
    auth_code:{type:String, default:null},
    join_date:{type:Date,  default: Date.now},
    exit_date:{type:Date,  default: null},
    exit_validate:{type:Boolean, default:false}
});


////////////////////////////////////////////////
//Deprecated Schema
////////////////////////////////////////////////

var peopleSchema = mongoose.Schema({
    relation:{type:String, default:null},
    name:{type:String, default:null},
    job:{type:String, default:null},
    contact:{type:String, default:null}
});

var eventSchema = mongoose.Schema({
  user_id:ObjectId,
  title:String,
  visible:Boolean,
  category:String,
  date:{type:Date, default:Date.now},
  memo:{type:String, default:null}
});

var activitySchema = mongoose.Schema({
  user_id:ObjectId,
  visible:Boolean,
  title:String,
  start_date:Date,
  category:String,

  end_date:{type:Date, default:null},
  info:[{title:String, body:MixedType}],
  article:[
    {title:String, body:String, img:[fileSchema]}
  ],
  file:[fileSchema],
  memo:{type:String, default:null}
});

var activityTempleteSchema = mongoose.Schema({
  category:String,
  items:[{title:String, length:Number}]
});

var resumeSchema = mongoose.Schema({
  user_id:ObjectId,
  visible:Boolean,
  title:String,
  submit:{check:{type:Boolean, default:false}, time:{type:Date, default:null}},
  body:[{question:String, answer:String, length:Number}]
});




////////////////////////////////////////////////
//Export
////////////////////////////////////////////////
module.exports.scActivity = mongoose.model('Activity', activitySchema);
module.exports.scActivityTemplete = mongoose.model('ActivityTempletes', activityTempleteSchema);
module.exports.scResume = mongoose.model('Resume', resumeSchema);
module.exports.scEvent = mongoose.model('Event', eventSchema);
module.exports.testSc = mongoose.model('test', testSchema);

module.exports.scUser = mongoose.model('User', userSchema);
module.exports.scCareer = mongoose.model('Career', careerSchema);
module.exports.scTemplete = mongoose.model('Templetes', templateSchema);
module.exports.scCategory = mongoose.model('Category', categorySchema);