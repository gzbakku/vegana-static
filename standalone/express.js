const express = require("express");
const setup = require("./setup");
const request = require("./request");

module.exports = {
    init:init
};

global.location = {
    protocol:'',
    hostname:'',
    port:'',
};

async function init(config,script){

    setup.init(config,script);

    start_server(config);

}

async function start_server(config){

    let app = express();
    app.all("/*",async (req,res)=>{

        let start = time();
        let path = req.originalUrl;

        let headers = {};
        for(let key in req.headers){
            headers[key] = req.headers[key];
        }
        let cookie = {};
        if(headers.cookie){
            cookie = headers.cookie;
        }

        let run = await request.init(path,headers,cookie);
        if(run.mime){res.type(run.mime);}
        res.status(run.status);
        res.send(run.reply);
        if(global.StaticLogTime){
            console.log(`time : ${time()-start} ms`);
        }

    });

    app.listen(config.port,()=>{
        console.log(`static server started on port ${config.port} Engine : Express`);
    });

}