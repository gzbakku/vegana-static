const fs = require("fs");
const browserify = require("browserify");
const tinyify = require("tinyify");

module.exports = {
  init:init,
  get:()=>{
    return map;
  }
};

let map;

async function init(){

  let cwd = await io.dir.cwd();

  let lazyPath = cwd + "/lazy.json";
  if(!await io.exists(lazyPath)){
    return common.error("not_found-lazy.json");
  }

  let lazy = await io.readJson(lazyPath);
  if(!lazy){
    return common.error("failed-read-lazy.json");
  }

  async function read_css(path){
    return io.read(path);
  }

  // global.window = {};
  window.pageModules = {};

  //load pages
  let pages = {};
  if(lazy.pages){
    for(let page of lazy.pages){
      let jsPath = cwd + "/app/pages/" + page + "/page.js";
      let cssPath = cwd + "/css/pages/" + page + "/page.css";
      pages[page] = {
        js:require(jsPath),
        css:await read_css(cssPath)
      };
    }
  }

  let conts = {};
  if(lazy.conts){
    for(let page in lazy.conts){
      conts[page] = {};
      for(let cont of lazy.conts[page]){
        let jsPath = cwd + "/app/pages/" + page + "/conts/" + cont + "/cont.js";
        let cssPath = cwd + "/css/pages/" + page + "/conts/" + cont + "/cont.css";
        conts[page][cont] = {
          js:require(jsPath),
          css:await read_css(cssPath)
        };
      }
    }
  }

  let panels = {};
  if(lazy.panels){
    for(let page in lazy.panels){
      panels[page] = {};
      for(let cont in lazy.panels[page]){
        panels[page][cont] = {};
        for(let panel of lazy.panels[page][cont]){
          let jsPath = cwd + "/app/pages/" + page + "/conts/" + cont + "/panels/" + panel + "/panel.js";
          let cssPath = cwd + "/css/pages/" + page + "/conts/" + cont + "/panels/" + panel + "/panel.css";
          panels[page][cont][panel] = {
            js:require(jsPath),
            css:await read_css(cssPath)
          };
        }
      }
    }
  }

  let globals = {};
  if(lazy.globals){
    for(let comp of lazy.globals){
      let jsPath = cwd + "/app/globals/" + comp + "/globalComp.js";
      let cssPath = cwd + "/css/globals/" + comp + "/comp.css";
      globals[comp] = {
        js:require(jsPath),
        css:await read_css(cssPath)
      };
    }
  }

  let sasspacks = {};
  if(lazy.sass){
    for(let sass of lazy.sass){
      let cssPath = cwd + "/css/sassPack/" + sass + "/pack.css";
      sasspacks[sass] = {
        css:await read_css(cssPath)
      };
    }
  }

  let master_css_path = cwd + "/css/master.css/";
  let master_css = await read_css(master_css_path);

  let engine_path = cwd + "/node_modules/vegana-engine/index";
  let vegana_engine = require(engine_path);

  if(!await io.dir.ensure(cwd + "/js/static")){
    return engine.common.error("failed-ensure-static_div-in_js");
  }

  //browserify creator
  let creator_pack;
  if(false){
    creator_pack = await make_browser_packs(
      'Creator',
      cwd + "/node_modules/vegana-engine/make/creator.js",
      cwd + "/js/static/creator.js"
    )
    .then((d)=>{return true;}).catch(()=>{return false;});
    // console.log('done 1a');
    creator_pack = await read_pack(cwd + "/js/static/creator.js");
    // console.log('done 1b');
  } else {
    creator_pack = await read_pack(cwd + "/js/static/creator.js");
  }
  if(!creator_pack){return common.error("failed-read-creator_pack");}

  // console.log("done 1");

  //browserify uniqid
  let uniqid_pack;
  if(false){
    uniqid_pack = await make_browser_packs(
      'Uniqid',
      cwd + "/node_modules/uniqid/index.js",
      cwd + "/js/static/uniqid.js"
    )
    .then((d)=>{return true;}).catch(()=>{return false;});
    // console.log('done 2a');
    uniqid_pack = await read_pack(cwd + "/js/static/uniqid.js");
    // console.log('done 2b');
  } else {
    uniqid_pack = await read_pack(cwd + "/js/static/uniqid.js");
  }
  if(!uniqid_pack){return common.error("failed-read-uniqid_pack");}

  map = {
    engine:vegana_engine,
    master_css:master_css,
    pages:pages,
    conts:conts,
    panels:panels,
    globals:globals,
    sasspacks:sasspacks,
    packs:{
      creator:creator_pack,
      uniqid:uniqid_pack
    }
  };

  return map;

}

async function make_browser_packs(name,read_path,write){

  return new Promise((resolve,reject)=>{

    browserify({ debug: false,standalone:name })
      .plugin(tinyify, { flat: false })
      .require(read_path,{entry: true})
      .bundle()
      .on("error", (err)=>{
        reject(err.message);
      })
      .on("end",()=>{
        setTimeout(function () {
          resolve();
        }, 100);
      })
      .pipe(fs.createWriteStream(write,{encoding:'utf8'}));

  });

}

async function read_pack(path){

  let p = await io.read(path);
  if(!p){return false;}
  p = p.trim();

  while (false){
    if(p[p.length-1] === ";"){
      p = p.slice(0,-1);
    } else {
      break;
    }
  }

  return p;

}
