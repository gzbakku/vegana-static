const execute = require("./test_execute");
const mime = require('mime'); 

module.exports = {
    init:init
};

function success(m,mime){
    return {reply:m,status:200,mime:mime||"text/html"};
}

function error(m,c,mime){
    return {reply:m,status:c||500,mime:mime||"text/plain"};
}

async function init(path_with_params,headers,cookie_string){

    let exists = await io.exists(`.${path_with_params}`);
    if(typeof(exists) === undefined){
        return error("failed check if path is a file");
    }
    if(exists){
        let read = await io.read(`.${path_with_params}`,true);
        if(!read){
            return error("failed-read_file");
        } else {
            let m = mime.getType(path_with_params);
            return success(read,m);
        }
    }

    const message = {
        location:location,
        path:path_with_params,
        url:`${location.href}${path_with_params}`,
        headers:headers || {},
        cookie:cookie_string || ''
    };
    
    let run = await execute.init(message)
    .then((d)=>{return d;}).catch(()=>{return false;});

    if(!run){
        return error("failed-execute-bundle");
    } else {
        return success(run);
    }

}