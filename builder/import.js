const io = require("../io");


module.exports = {
    init:init
};

async function init(){

    console.log("builder imported initiated");

    const app_dir = await io.dir.cwd();
    const lazy_file = await io.readJson(`${app_dir}/lazy.json`);

    console.log(lazy_file);

    console.log({app_dir:app_dir});

}
