const fastify = require("fastify");
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

    let app = fastify();
    // app.disable('etag');
    if(global.start_resources_page){
        console.log(`>>> status page enabled go to url/status for usage details`);
        app.use(require('express-status-monitor')());
    }
    app.all("/*",async (req,res)=>{

        // console.log(req);

        let start = time();
        let path = req.url;

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
            // let last_modified = headers["if-modified-since"];
            // console.log({last_modified:last_modified});
            if(global.StaticLogTime){
                count += 1;
                console.log(`${count} cached, time : ${time()-start} ms`);
            }
            res.statusCode = 304;
            res.send();
            return;
        }

        // console.log(global.lastModified);

        let run = await request.init(path,headers,cookie);
        if(run.mime){res.type(run.mime);}
        if(global.lastModified){
            res.header("Last-Modified",global.lastModified);
        }
        if(global.useCacheControlMaxAge){
            res.header("Cache-Control",`max-age=${global.cache_control_max_age_time}`);
        }
        res.statusCode = run.status;
        res.send(run.reply);
        if(global.StaticLogTime){
            count += 1;
            console.log(`${count} fresh, time : ${time()-start} ms`);
        }

    });

    app.listen({
        port:config.port
    },()=>{
        console.log(`static server started on port ${config.port} Engine : Fastify`);
    });

}