
global.window = {
  addEventListener:()=>{}
};
global.document = {
  getElementsByTagName:()=>{return [];}
};

global.executer = require("./executer/index");
global.builder = require("./builder");
global.engine = require("./engine/index");
global.common = require("./common");
global.cmd = require("./cmd_mod");
global.io = require("./io");
global.input = require("input");
global.exit_on_error = false;


async function main(){

  let options = ['serve','config','build'];

  let flags = process.argv;
  let func = flags[2], val1 = flags[3], val2 = flags[4], val3 = flags[5];
  if(!func || options.indexOf(func) < 0){
    func = await input.select('please provide a api function',['serve','config','build'])
  }

  if(func === 'build'){
    executer.maker.init(val1,val2,val3);
  } else if(func === 'serve'){
    executer.server.init(val1,val2,val3);
  } else if(func === 'config'){
    executer.config.init(val1,val2,val3);
  }

}

main();
