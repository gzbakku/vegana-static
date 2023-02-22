const process = require("process");
global.io = require("../io");
// global.engine = require("../engine/index");
global.is_static = true;
window.is_static = true;

global.is_static_web = false;
window.is_static_web = false;

global.is_cordova = false;
window.is_cordova = false;

global.is_electron = false;
window.is_electron = false;

global.is_native = false;
window.is_native = false;

global.is_web = false;
window.is_web = false;

global.engine = require("../../vega/index");
const base36 = require("base36").base36encode;

module.exports = {
    init:init
};

async function init(config){

    // console.log("builder is initated");

    //autocannon -d 20 -p 2 -c 10 http://localhost:5567/

    let var_num = 1;

    global.builder = {
        HTML_ELEMENTS:{
            // "head":{parent:"html",id:"head",tag:'head'},
            "router":{parent:"body",id:"router",tag:'div'},
            "page-loader":{parent:"router",id:"page-loader",tag:'div'},
            "page-router":{parent:"router",id:"page-router",tag:'div'},
        },
        HTML_HEADERS:{
            "title":{parent:"head",id:"title",tag:"title",innerHTML:"this is title"}
        },
        hash:{},
        functions:[],
        functionData:[],
        functionCalls:[],
        variables:[],
        icon:null,
        meta_name:{
            "viewport":{
                "name":"viewport",
                "content":"width=device-width, initial-scale=1"
            }
        },
        meta_noname:[
            {"charset":"utf-8"}
        ],
        load:{
            js:[],
            css:[]
        },
        css:[],
        fonts:[],
        publish:publish,
        html:require("./html_elem_builder"),
        object_to_string:require("./object_to_string"),
        custom_style_name:{},
        add:{
            css:(v)=>{builder.css.push(v);},
            meta:(v)=>{
                if(v.name){builder.meta_name[v.name] = v;} 
                else {builder.meta_noname.push(v);}
            },
            functionCall:(v)=>{builder.functionCalls.push(v);},
            function:(v)=>{builder.functions.push(v);},
            functionData:(v)=>{builder.functionData.push(v);},
            variable:(v)=>{builder.variables.push(v);},
            font:(v)=>{builder.fonts.push(v);},
            icon:(v)=>{builder.icon = v;}
        },
        remove:{
            meta:(v)=>{delete builder.meta_name[v];}
        },
        get_name:()=>{
            let local_num = var_num;
            var_num++;
            let build = `VJ_${base36(local_num)}`;
            return build;
        }
    };

    // l

    class FontFace{
        constructor(name,location){
            this.name = name;
            this.location = location;
        }
        load(){
            return new Promise((resolve,reject)=>{
                resolve(this);
            });
        }
    }

    class Image{
        constructor(){
            this.src = null;
        }
    }

    global.baseHref = "";
    global.FontFace = FontFace;
    global.Image = Image;
    global.config = config;
    global.veganaLayoutColors = {};
    global.veganaLayoutFonts = {};
    // global.veganaJsAnimations = {};

    // window.veganaJsAnimations = {};

    // global.engine = require("../../vega/index");
    global.variableChecked = engine.static.add.js.variableChecked;

    require("./window");
    require("./document");
    require("./navigator");

    const cwd = process.cwd();
    const path = `${cwd}/app/index.js`;
    require(path);

}

function publish(){

    //-------------------------------
    //load primary modules
    //-------------------------------

    engine.loader.load.js({
        type:'local',
        url:'bundle.js'
    });

    engine.loader.css("master.css",false);
    engine.loader.css("remixicon.css",false);
    
    //-------------------------------
    //make full html
    //-------------------------------
    const body = builder.html.init(builder.HTML_ELEMENTS,"body");
    if(!body){kill();}
    const head = builder.html.init(builder.HTML_HEADERS,"head");
    if(!head){kill();}
    let final = builder.html.wrap(
        {tag:"html",id:'html'},
        [head,body],
        0
    );

    //-------------------------------
    //customize final html
    //-------------------------------

    //-------------------------------
    //meta elements
    //-------------------------------
    for(let key in builder.meta_name){
        final = final.replace("</head>",` ${make_meta_html_element(builder.meta_name[key])}\n </head>`);
    }
    for(let item of builder.meta_noname){
        final = final.replace("</head>",` ${make_meta_html_element(item)}\n </head>`);
    }

    //-------------------------------
    //add css
    //-------------------------------

    //-------------------------------
    //add css fonts
    //-------------------------------
    final = final.replace("</head>",` <style>
        ${make_primary_custom_css()}
    </style>\n </head>`);

    //-------------------------------
    //add css links
    //-------------------------------
    for(let item of builder.load.css){
        final = final.replace("</head>",` ${make_css_html_element(item)}\n </head>`);
    }
    if(builder.icon){
        final = final.replace("</head>",` <link red="icon" href="${builder.icon}" type="image/x-icon"/>\n </head>`);
    }

    //-------------------------------
    //add raw css
    //-------------------------------
    let raw_css = '';
    for(let item of builder.css){
        if(item.length > 0){
            raw_css += `${item}`;
            if(item[item.length-1] !== "\n"){raw_css += "\n";}
        }
    }
    final = final.replace("</head>",` <style>
        ${raw_css}
    </style>\n </head>`);

    //-------------------------------
    //add js
    //-------------------------------

    //-------------------------------
    //add flags
    //-------------------------------
    final = final.replace("</body>",` <script>
        window.is_static = false;
        window.is_static_web = true;
        window.is_cordova = false;
        window.is_electron = false;
        window.is_native = false;
        window.is_web = false;
    </script>\n </body>`);

    //-------------------------------
    //add live reload here
    //-------------------------------
    final = final.replace("</head>",` <script type="text/javascript" src="http://localhost:5566/js/socket.io.js"></script>\n </head>`);
    final = final.replace(
        "</head>",
        `<script type="text/javascript">
            let socket = io.connect('http://localhost:7879');
            socket.on('reload',(data)=>{
            location.reload();
            });
        </script>
  </head>`
    );

    //-------------------------------
    //add js links
    //-------------------------------
    for(let item of builder.load.js){
        final = final.replace("</body>",` ${make_js_html_element(item)}\n </body>`);
    }

    //-------------------------------
    //add custom js
    //-------------------------------
    let js = ``;
    for(let item of builder.variables){js += `\n${item}\n`;}
    for(let item of builder.functions){js += `\n${item}\n`;}
    for(let item of builder.functionCalls){js += `\n${item}\n`;}
    js += `\nengine.static.init();\n`;
    final = final.replace("</body>",` <script>\n${js}\n  </script>\n </body>`);

    process.send({
        html:final
    });

}

function make_primary_custom_css(){
    let build = ``;
    for(let font of builder.fonts){
        let hold = ``;
        hold += `\nfont-family: ${font.tag};\n`;
        hold += `src: url("${font.location}");\n`;
        hold = `@font-face{${hold}}`;
        build += `\n${hold}\n`;
    }
    return build;
}

function make_meta_html_element(data){
    let build = `<meta`;
    for(let key in data){
        let key_name = key;
        if(key_name === "httpEquiv"){key_name = "href";}
        build += ` ${key_name}="${data[key]}"`;
    }
    build += ` />`;
    return build;
}

function make_css_html_element(data){
    let build = `<link rel="stylesheet"`;
    build += ` href="${data.location}">`;
    return build;
}

function make_js_html_element(data){
    let build = `<script`;
    if(data.id){build += ` id="${data.id}"`;}
    if(data.is_module){build += ` type="module"`;}
    build += ` src="${data.location}"></script>`;
    return build;
}

global.kill = ()=>{
    console.log("killing process");
    process.kill(process.pid);
}

process.on("message",(config)=>{
    init(config);
});



