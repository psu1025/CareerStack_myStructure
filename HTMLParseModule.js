/**
 * Created by Aristein on 14. 5. 11.
 */


var templates = {
    big:[
        "picture",
        "video",
        "map"
    ],

    middle:[
        "text"
    ],

    small:[
        "date",
        "time",
        "link",
        "memo",
        "file"
    ]
}



exports.parsingTemplate = function(templates){
    var html = '';

    if(template.length > 0){
        template.forEach(function(template){
            //내부 각각의 Template의 대해
            html += parsing(template);
        });
    }

    return html;
}

var parsing = function(template){

    var data = "";

    if(template.classify == "merge"){
        data = parsingMerge(template);
    }
    else{
        data = parsingStandalone(template);
    }

    return data;
}

var parsingStandalone(template){

    var type = template.type;

    var data = '<div style="height: ' + template.size.height + 'px; border-style:solid; border-width:1px;">';

    //이름은 굵게
    data += "<p style='font-weight: bold'>" + template.name + "</p>";


    if(type == "memo"){
        //메모일 경우
        data += "<p style='padding: 2px 2px 2px 20px;'>" + template.attribute.memo + "</p>";
    }
    else if(type == "link"){
        //링크일 경우
    }
    else if(type == "file"){
        //파일일 경우
    }
    else if(type == "date"){
        //날짜일 경우
    }
    else{
        //예외
    }

    data += "</div>";
    return data;
}

var parsingMerge(template){
    var data = "";
    return data;
}