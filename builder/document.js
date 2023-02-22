

global.document = {
    location:config.location,
    URL:config.url,
    fonts:{
        add:(font)=>{
            builder.fonts[font.name] = font.location;
        }
    },
    body:{
        clientWidth:0,
        clientHeight:0
    },
    documentElement:{
        clientWidth:0,
        clientHeight:0
    }
};
global.DOCUMENT = global.document;

document.getElementsByTagName = (tag)=>{
    return [];
}

document.getElementById = (id)=>{
    if(!builder.HTML_ELEMENTS[id]){
        return null;
    }
    let build = builder.HTML_ELEMENTS[id];
    build.add = (object)=>{
        object.parent = build.id;
        builder.HTML_ELEMENTS[object.id] = object;
    }
    build.remove = ()=>{
        delete builder.HTML_ELEMENTS[build.id];
    }
    build.appendChild = build.add;
    return build;
}

document.createElement = (tag)=>{
    let build = {
        tag:tag
    };
    build.addEventListener = (event,func)=>{
        if(!build.events){build.events = {};}
        let name = engine.static.add.js.function(null,`${func}`);
        // if(event === "click"){event = 'onclick';}
        // if(event === "input"){event = 'onkeyup';}
        build[event] = `${name}()`;
    };
    return build;
}