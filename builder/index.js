const process = require("process");
const base36 = require("base36").base36encode;

module.exports = {
    init:init
};

async function init(config){

    global.window = new Proxy({},{
        set:(obj,key,val)=>{
            obj[key] = val;
            global[key] = obj[key];
        }
    });

    require("./compiled").init(config);

    const cwd = process.cwd();
    const path = `${cwd}/compile.js`;
    require(path);

    if(window.veganaStaticPublished){
        process.send({
            html:window.veganaStaticPublished
        });
    }

}

global.kill = ()=>{
    console.log("killing process");
    process.kill(process.pid);
}

process.on("message",(config)=>{
    init(config);
});