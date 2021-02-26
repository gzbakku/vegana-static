const log = false;
const httpMarker = 'http://';

let loaded = {
  comp:[],page:[],cont:[],panel:[]
};

module.exports = {

  load : {

    image:function(url){return true;},

    wasm : async function(options){
      return new Promise(async (resolve,reject)=>{reject("cannot load wasm in static load it in browser");});
    },

    js:load_js,

    comp:(compName,load_css)=>{
      if(loaded.comp.indexOf(compName) >= 0){return true;}
      let map = builder.map.get();
      let comp = map.globals[compName];
      if(load_css){builder.add_css(comp.css);}
      loaded.comp.push(compName);
      return return_resolve();
    },

    page:(pageName,load_css)=>{
      if(loaded.page.indexOf(pageName) >= 0){return true;}
      let map = builder.map.get();
      let page = map.pages[pageName];
      if(load_css){builder.add_css(page.css);}
      loaded.page.push(pageName);
      return return_resolve();
    },

    cont:(pageName,contName,load_css)=>{
      if(loaded.cont.indexOf(pageName+'_'+contName) >= 0){return true;}
      let map = builder.map.get();
      let cont = map.conts[pageName][contName];
      if(load_css){builder.add_css(cont.css);}
      loaded.cont.push(pageName+'_'+contName);
      return return_resolve();
    },

    panel:(pageName,contName,panelName,load_css)=>{
      if(loaded.panel.indexOf(pageName+'_'+contName+'_'+panelName) >= 0){return true;}
      let map = builder.map.get();
      let panel = map.panels[pageName][contName][panelName];
      if(load_css){builder.add_css(panel.css);}
      loaded.panel.push(pageName+'_'+contName+'_'+panelName);
      return return_resolve();
    },

    sassPack : function(packName,is_link){
      if(is_link){return engine.common.error("cannot import non native css packs");}
      let map = builder.map.get();
      builder.add_css(map.sasspacks[packName].css);
      return_resolve()
    }

  },

  css : load_css,

  hook : {
    comp:(data)=>{return data.function();},
    page:(data)=>{return data.function();},
    cont:(data)=>{return data.function();},
    panel:(data)=>{return data.function();}
  }

};

function return_resolve(){
  return new Promise((resolve)=>{resolve(true);});
}

function load_js(id,location,is_module){
  return new Promise((resolve,reject)=>{
    reject("cannot load external js in static");
  });
}

function load_css(location){
  return new Promise((resolve,reject)=>{
    reject("cannot load external css in static");
  });
}
