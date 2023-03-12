
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