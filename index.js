
global.server = require("./server");
global.builder = require("./builder");
global.engine = require("./engine/index");
global.common = require("./common");
global.cmd = require("./cmd_mod");
global.io = require("./io");

async function main(){

  if(true && !await builder.init.init()){
    return common.error("failed initiate builder");
  }

  let vegana_map = await builder.map.init();
  if(!vegana_map){
    return common.error("failed build map");
  }

  let build = await builder.start.init().then(()=>{return true;}).catch(()=>{return false;});
  if(!build){
    return common.error("failed build start");
  }

  server.init();

  // console.log(vegana_map);

}

main();
