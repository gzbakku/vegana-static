
global.window = {};

// let engine = require("../vega/index");

const express = require("express");
const mime = require('mime'); 
const app = express();

const builder = require("./builder/index.js");
const cluster = require("cluster");
const tools = require("./tools");

const setup = require('./standalone/setup');

module.exports = {
    init:init
};

global.location = {
    protocol:'',
    hostname:'',
    port:'',
};

async function init(config){

    // config = config.dev;

    global.env = 'dev';
    
    if(!cluster.fork){
        return;
    }

    setup.init(config);

    config = config[env];

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

    fork.on("message",(message)=>{});

}

async function start_server(config){
    
    app.all("/*",async (req,res)=>{

        let start = time();
        let path = req.originalUrl;

        let exists = await io.exists(`.${path}`);
        if(typeof(exists) === undefined){
            res.send("error");
            return;
        }

        if(exists){
            let read = await io.read(`.${path}`,true);
            if(read){
                let m = mime.getType(`.${path}`);
                if(m){res.type(m);}
                res.send(read);
                return;
            }
        }

        let headers = {};
        for(let key in req.headers){
            headers[key] = req.headers[key];
        }
        let cookie = {};
        if(headers.cookie){
            cookie = headers.cookie;
        }

        const message = {
            location:location,
            path:path,
            url:`${location.href}${path}`,
            headers:headers,
            cookie:cookie
        };

        let hold = await run_request(message);
        let now = time();
        console.log(`### request time : ${now-start} ms`);

        if(!hold){
            res.send('some error');
        } else {
            res.send(hold);
        }
        
    });

    app.listen(config.port,()=>{
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


//old
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