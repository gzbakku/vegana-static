const fs = require("fs");
const browserify = require("browserify");
const tinyify = require("tinyify");

module.exports = {
  init:init,
  get:()=>{
    return map;
  },
  browserify:browserify_read_only,
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

  async function read_file_text(path){
    return io.read(path);
  }

  let bundle = await read_file_text(cwd + '/js/bundle.js');
  if(!bundle){return common.error("failed-read-bundle");}

  // global.window = {};
  window.pageModules = {};

  //load pages
  let pages = {};
  if(lazy.pages){
    for(let page of lazy.pages){
      let jsPath = cwd + "/app/pages/" + page + "/page.js";
      let cssPath = cwd + "/css/pages/" + page + "/page.css";
      pages[page] = {
        jsText:await read_file_text(jsPath),
        js:require(jsPath),
        css:await read_file_text(cssPath)
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
          jsText:await read_file_text(jsPath),
          js:require(jsPath),
          css:await read_file_text(cssPath)
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
            jsText:await read_file_text(jsPath),
            js:require(jsPath),
            css:await read_file_text(cssPath)
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
        jsText:await read_file_text(jsPath),
        js:require(jsPath),
        css:await read_file_text(cssPath)
      };
    }
  }

  let sasspacks = {};
  if(lazy.sass){
    for(let sass of lazy.sass){
      let cssPath = cwd + "/css/sassPack/" + sass + "/pack.css";
      sasspacks[sass] = {
        css:await read_file_text(cssPath)
      };
    }
  }

  let master_css_path = cwd + "/css/master.css/";
  let master_css = await read_file_text(master_css_path);

  let engine_path = cwd + "/node_modules/vegana-engine/index";
  let vegana_engine = require(engine_path);

  if(!await io.dir.ensure(cwd + "/js/static")){
    return engine.common.error("failed-ensure-static_div-in_js");
  }

  let engine_pack = await process_pack(
    'Engine',
    cwd + "/node_modules/vegana-engine/index.js",
    cwd + "/js/static/engine.js"
  );
  if(!engine_pack){return common.error("failed-read-engine_pack");}

  //browserify creator
  let creator_pack = await process_pack(
    'Creator',
    cwd + "/node_modules/vegana-engine/make/creator.js",
    cwd + "/js/static/creator.js"
  );
  if(!creator_pack){return common.error("failed-read-creator_pack");}

  let uniqid_pack = await process_pack(
    'Uniqid',
    cwd + "/node_modules/uniqid/index.js",
    cwd + "/js/static/uniqid.js"
  );
  if(!uniqid_pack){return common.error("failed-read-uniqid_pack");}

  let view_pack = await process_engine_api("view");
  if(!view_pack){return common.error("failed-read-view_pack");}

  let data_pack = await process_engine_api("data");
  if(!view_pack){return common.error("failed-read-view_pack");}

  let router_pack = await process_engine_api("router");
  if(!router_pack){return common.error("failed-read-router_pack");}

  let loader_pack = await process_engine_api("loader");
  if(!loader_pack){return common.error("failed-read-loader_pack");}

  let make_pack = await process_engine_api("make");
  if(!make_pack){return common.error("failed-read-make_pack");}

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
      uniqid:uniqid_pack,
      view:view_pack,
      data:data_pack,
      router:router_pack,
      loader:loader_pack,
      make:make_pack,
      engine:engine_pack,
      bundle:bundle
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

async function browserify_read_only(read,name){
  return new Promise(async (resolve,reject)=>{
    let hold = browserify({ debug: false,standalone:name })
      .plugin(tinyify, { flat: false })
      .require(read,{entry: true})
      .bundle((e,d)=>{
        if(e){reject(e);} else {
          var enc = new TextDecoder();
          resolve(enc.decode(d));
        }
      });
  });
}

async function process_engine_api(name){
  let cwd = await io.dir.cwd();
  return process_pack(
    capitalizeFirstLetter(name),
    cwd + `/node_modules/vegana-engine/${name}.js`,
    cwd + `/js/static/${name}.js`
  );
}

async function process_pack(name,read,write){
  let pack;
  if(!await io.exists(write) || (false && (name === "Router" || name === "Make"))){
    pack = await make_browser_packs(name,read,write)
    .then((d)=>{return true;}).catch(()=>{return false;});
  }
  pack = await read_pack(write);
  if(!pack){return common.error("failed-read-pack");} else {return pack;}
}

async function read_pack(path){
  let p = await io.read(path);
  if(!p){return false;}
  return p;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
