
global.window = {};

// let engine = require("../vega/index");

const server = require("uWebSockets.js");
const builder = require("./builder/index.js");
const cluster = require("cluster");
const tools = require("./tools");

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

    let path = "";
    let headers = {};
    let url = `${location.href}${path}`;
    let fork = cluster.fork("./builder/index",['child']);

    let send = fork.send({
        config:config,
        location:location,
        path:path,
        url:url,
        headers:headers,
        cookie:''
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
            res.aborted = true;
        });

        let headers = {};
        req.forEach((key,value)=>{
            headers[key] = value;
        });
        let reqUrl = req.getUrl();
        let reqQueries = req.getQuery();
        let path = reqUrl;
        if(reqQueries.length > 0){path += `?${reqQueries}`;}
        let exists = await io.exists(`.${path}`);
        if(typeof(exists) === undefined){
            res.end("error");
            return;
        }

        if(exists){
            let read = await io.read(`.${path}`,true);
            if(read){
                if(res.aborted){
                    return;
                } else {
                    res.end(read);
                    return;
                }
            }
        }

        let url = `${location.href}${path}`;
        let cookie = '';
        if(headers.cookie){
            cookie = headers.cookie.split(";");
        }

        const message = {
            location:location,
            path:path,
            url:url,
            headers:headers,
            cookie:cookie
        };

        let start = new Date().getTime();
        let hold = await run_request(message);
        let now = new Date().getTime();
        console.log(`### request time : ${now-start} ms`);

        if(res.aborted){
            return;
        }
        if(!hold){
            res.end('some error');
        } else {
            res.end(hold);
        }
        
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