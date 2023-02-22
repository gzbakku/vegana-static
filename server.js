
global.window = {};

// let engine = require("../vega/index");

const server = require("uWebSockets.js");
const builder = require("./builder/index.js");
const cluster = require("cluster");

module.exports = {
    init:init
};

let location = {
    protocol:'',
    hostname:'',
    port:'',
};

async function init(config){

    // console.log("static sever called");
    
    if(!cluster.fork){
        return;
    }

    build_location(config);

    test_builder(config);

    start_server(config);

}

async function test_builder(config){

    // console.log("test_builder");

    let path = "/layout?params=true";
    let headers = {};
    let url = `${location.href}${path}`;
    let fork = cluster.fork("./builder/index",['child']);

    let send = fork.send({
        config:config,
        location:location,
        path:path,
        url:url,
        headers:headers
    });

    // console.log({send:send});

    fork.on("message",(message)=>{
        // console.log({final:message});
    });

}

async function start_server(config){
    let app = server.App();
    
    app.any("/*",async (res,req)=>{

        res.onAborted((e) => {
            // console.log("!!! response aborted : " + e);
            res.aborted = true;
        });

        let path = `${req.getUrl()}?${req.getQuery()}`;
        let url = `${location.href}${path}`;
        let headers = {};
        req.forEach((key,value)=>{
            headers[key] = value;
        });

        const message = {
            location:location,
            path:path,
            url:url,
            headers:headers
        };

        let start = engine.time.now();
        let hold = await run_request(message);
        console.log(engine.time.elapsed(start).value + ` : ${res.aborted}`);

        if(res.aborted){
            // console.log("!!! response aborted");
            return;
        }
        if(!hold){
            res.end('some error');
        }
        res.end(hold);

        // res.end('Hello World! error');

        // res.end('Hello World!');

    });

    app.listen(config.port,(token)=>{
        if(!token){
            console.error(`failed to start the static server`);
            return;
        }
        console.log(`static server started on port ${config.port}`);
    });

}

function run_request(message,run){
    if(!run){
        return new Promise((resolve,reject)=>{
            setTimeout(async ()=>{
                resolve(await run_request(message,true));
            },0);
        })
        .then((v)=>{return v;});
    }
    return new Promise((resolve,reject)=>{
        let fork = cluster.fork("./builder");
        fork.send(message);
        fork.on("message",(message)=>{
            if(message.html){
                resolve(message.html);
            } else {
                reject();
            }
        });
    })
    .then((v)=>{return v;})
    .catch(()=>{return false;});
}

function build_location(config){
    
    let full = config.domain;
    if(config.domain.includes("https://")){
        location.protocol = 'https:';
        config.domain = config.domain.replace("https://","");
    }
    if(config.domain.includes("http://")){
        location.protocol = 'http:';
        config.domain = config.domain.replace("http://","");
    }
    if(/:([\d]+)/.test(config.domain)){
        let hold = config.domain.split(':');
        location.port = hold[1];
        config.domain = hold[0];
    }

    let hostname_array = config.domain.split(".");
    let tld = hostname_array.pop();
    let hostname = '';
    for(let item of hostname_array){
        hostname += hostname.length > 0 ? `.${item}` : `${item}`;
    }
    hostname += `.${tld}`;
    location.tld = tld;
    location.hostname = hostname;
    location.host = hostname;
    location.href = full;

}