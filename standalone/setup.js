
module.exports = {
    init:init
};

global.location = {
    protocol:'',
    hostname:'',
    port:'',
};

async function init(config,script){

    global.TIMEOUT = 5000;
    
    global.bundle = script;

    build_location(config);

}

function build_location(config){

    //setup last modified
    global.lastModified = config.lastModified || time();
    global.lastModified = new Date(global.lastModified).toUTCString();

    config = config[global.env];
    
    let full = config.base_url;
    if(config.base_url.includes("https://")){
        location.protocol = 'https:';
        config.base_url = config.base_url.replace("https://","");
    }
    if(config.base_url.includes("http://")){
        location.protocol = 'http:';
        config.base_url = config.base_url.replace("http://","");
    }
    if(/:([\d]+)/.test(config.base_url)){
        let hold = config.base_url.split(':');
        location.port = hold[1];
        config.base_url = hold[0];
    }

    let hostname_array = config.base_url.split(".");
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