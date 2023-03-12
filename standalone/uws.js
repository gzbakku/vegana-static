const server = require("uWebSockets.js");
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

    let app = server.App();
    app.any("/*",async (res,req)=>{

        let start = time();

        res.onAborted((e) => {
            res.aborted = true;
        });

        let headers = {};
        req.forEach((key,value)=>{
            headers[key] = value;
        });
        let cookie = '';
        if(headers.cookie){
            cookie = headers.cookie;
        }

        let reqUrl = req.getUrl();
        let reqQueries = req.getQuery();
        let path = reqUrl;
        if(reqQueries.length > 0){path += `?${reqQueries}`;}

        let run = await request.init(path,headers,cookie);
        if(run.mime){
            res.writeHeader("Content-Type",run.mime);
        }
        res.writeStatus(run.status.toString());
        res.end(run.reply);
        if(global.StaticLogTime){
            console.log(`time : ${time()-start} ms`);
        }

    });

    app.listen(config.port,(token)=>{
        if(!token){
            console.error(`failed to start the static server`);
            return;
        }
        console.log(`static server started on port ${config.port} Engine : UWS`);
    });

}