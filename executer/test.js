

module.exports = {
  init:init
}

async function init(){

  builder.set.url("https://some.com/main?p=true&f=false");
  builder.set.build_type("engine");

  if(false && !await builder.init.init()){
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

  await start_server();

}

const compression = require('compression');
const express = require("express");
const app = express();

async function start_server(){

  let cwd = await io.dir.cwd();
  let projectLocation = cwd + '/';

  app.use(compression());

  app.get('/*',async (req, res) => {
    let combine = cwd + req.path;
    if(req.path.length > 1 && await io.exists(combine)){
      res.sendFile(combine);
    } else {
      let page = builder.finish();
      res.set('Content-Type', 'text/html');
      res.send(Buffer.from(page))
    }
  });

  let port = process.env.PORT || 5567;

  app.listen(port,true,'50mb', () => {
    console.log(`Example app listening at http://localhost:`+port)
  });

}
