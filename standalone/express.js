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

    config = config[env];

    start_server(config);

}

let count = 0;

async function start_server(config){

    let app = express();
    app.disable('etag');
    if(global.start_resources_page){
        console.log(`>>> status page enabled go to url/status for usage details`);
        app.use(require('express-status-monitor')());
    }
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

        if(global.useLastModified && (
            headers["if-modified-since"] && 
            headers["if-modified-since"] === global.lastModified
        )){
            let last_modified = headers["if-modified-since"];
            if(global.StaticLogTime){
                count += 1;
                console.log(`${count} cached, time : ${time()-start} ms`);
            }
            res.status(304);
            res.send();
            return;
        }

        // console.log(global.lastModified);

        let run = await request.init(path,headers,cookie);
        if(run.mime){res.type(run.mime);}
        if(global.lastModified){
            res.set("Last-Modified",global.lastModified);
        }
        if(global.useCacheControlMaxAge){
            res.set("Cache-Control",`max-age=${global.cache_control_max_age_time}`);
        }
        res.status(run.status);
        res.send(run.reply);
        if(global.StaticLogTime){
            count += 1;
            console.log(`${count} fresh, time : ${time()-start} ms`);
        }

    });

    app.listen(config.port,()=>{
        console.log(`static server started on port ${config.port} Engine : Express`);
    });

}