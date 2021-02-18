

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

  global.window = {};
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

  map = {
    master_css:master_css,
    pages:pages,
    conts:conts,
    panels:panels,
    globals:globals,
    sasspacks:sasspacks
  };

  return map;

}
