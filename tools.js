

global.io = require("./io");
global.time = ()=>{
    return new Date().getTime();
}

module.exports = {
    io:io
};