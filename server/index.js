
const compression = require('compression');
const express = require("express");
const app = express();

module.exports = {
  init:init
};

async function init(){

  let cwd = await io.dir.cwd();
  let projectLocation = cwd + '/';

  app.use(compression());

  app.get('/*',async (req, res) => {
    let combine = cwd + req.path;
    if(req.path.length > 1 && await io.exists(combine)){
      res.sendFile(combine);
    } else {
      let page = builder.get();
      res.set('Content-Type', 'text/html');
      res.send(Buffer.from(page))
    }
  });

  let port = process.env.PORT || 5567;

  app.listen(port,true,'50mb', () => {
    console.log(`Example app listening at http://localhost:`+port)
  });

}
