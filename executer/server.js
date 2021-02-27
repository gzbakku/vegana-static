

const md5 = require("md5");

module.exports = {
  init:init
}

async function init(flag){

  let forced = false;
  if(flag === "--forced" || flag === "-f"){forced = true;}

  const config = {
    host:'https://someone.com',
    port:5567,
    on_unknown:'index',
    on_unknown_build_type:'required',
    error_page:{query:'/404',build_type:'required'},
    urls:[
      {query:'/main',build_type:'required'},
      {query:'/one',build_type:'required'},
      {query:'/one/two',build_type:'required'},
      {query:'/one/one',build_type:'required'},
      {query:'/one/one/one',build_type:'required'},
      {query:'/one/one/two',build_type:'required'},
    ]
  };

  if(!engine.validate.json({
    host:{type:'string'},
    port:{type:'number',min:1,max:526290},
    on_unknown:{type:'string',options:['index','build']},
    on_unknown_build_type:{type:'string',options:['bundle','engine','required']},
    error_page:{type:'object',validate:{
      schema:{
        query:{type:'string',max:4084},
        build_type:{type:'string',options:['bundle','engine','required']}
      }
    }},
    urls:{type:'array',min:1}
  },config)){
    return common.error("failed-invalid-config");
  }

  for(let i of config.urls){
    if(!engine.validate.json({
      query:{type:'string',max:4084},
      build_type:{type:'string',options:['bundle','engine','required']}
    },i)){
      return common.error("failed-invalid-url-config");
    }
  }

  if(false && !await builder.init.init()){
    return common.error("failed initiate builder");
  }

  let cwd = await io.dir.cwd();
  let static_path = cwd + "/dist/static"

  if(!await io.dir.ensure(static_path)){
    return engine.common.error("failed-ensure-static_directory => " + static_path);
  }

  let promises = [];
  for(let page of config.urls){
    promises.push(build_page(config.host,page,static_path,forced));
  }
  // promises.push(build_page(config.host,config.error_page,static_path,forced));

  let final = await Promise.all(promises)
  .then((r)=>{
    for(let i of r){
      if(!i){
        return false;
      }
    }
    return r;
  })
  .catch(()=>{return false;});

  if(!final){return engine.common.error("failed-build-pages");}

  await start_server(config,final);

}

const compression = require('compression');
const express = require("express");
const app = express();

async function start_server(config,files){

  let cwd = await io.dir.cwd();
  let projectLocation = cwd + '/';

  app.use(compression());

  app.get('/*',async (req, res) => {
    let combine = cwd + req.path;
    if(req.path.length > 1 && await io.exists(combine)){
      res.sendFile(combine);
    } else {
      // let page = builder.finish();
      // res.set('Content-Type', 'text/html');
      // res.send(Buffer.from(page))

      let hash = md5(req.path);

      if(files.indexOf(hash) >= 0){
        console.log("found");
      } else {

        if(config.config === "build"){
          
        }

      }

      res.send("hii");

    }
  });

  let port = process.env.PORT || config.port || 5567;

  app.listen(port,true,'50mb', () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });

}

async function build_page(host,page,static_path,forced){

  let full_path = host + page.query;
  let hash = md5(page.query);
  let file_path = `${static_path}/${hash}.html`;
  let command = `vegana-static build ${full_path} ${page.build_type} ${file_path}`;

  if(!forced && await io.exists(file_path)){return hash;}

  const run_command = await cmd.run(command)
  .then(()=>{return true;})
  .catch(()=>{return false;});
  if(!run_command){return false;} else {return hash;}

}
