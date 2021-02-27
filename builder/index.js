

let functions = [];
let primary_functions = [];
let apis = [];

let elements = {};
let children = {};
let resolver;
let metas = {};
let pageTitle = 'sample static page';
let built;

let base_href = 'http://localhost:' + (process.env.PORT || 5567);

let last_class_num = 0;
let last_id_num = 0;

let globals = {
  functions:[],
  objects:[],
  comps:[]
};
let css = [];
let router_added = false;

let lazyModules = {
  globals:[],
  pages:[],
  conts:{},
  panels:{}
};

let url = '';
let build_type = 'required';

module.exports = {

  init:require("./init"),
  map:require("./map"),
  start:require("./start"),

  wrap_element:wrap_element,
  parse_url:parse_url,

  set:{
    url:(l)=>{url = l;},
    build_type:(l)=>{build_type = l;}
  },

  get:{

    url:()=>{return url;},
    build_type:()=>{return build_type;},

    apis:()=>{return apis;},
    functions:()=>{return functions;},
    primary_functions:()=>{return primary_functions;},
    lazyModules:()=>{return lazyModules;},
    globals:()=>{return globals;},

  },

  lazyModules:{
    add:{
      globalComp:(compName)=>{if(lazyModules.globals.indexOf(compName) < 0){lazyModules.globals.push(compName);}},
      page:(pageName)=>{if(lazyModules.pages.indexOf(pageName) < 0){lazyModules.pages.push(pageName);}},
      cont:(pageName,contName)=>{
        if(!lazyModules.conts[pageName]){lazyModules.conts[pageName] = [];}
        if(lazyModules.conts[pageName].indexOf(contName) < 0){lazyModules.conts[pageName].push(contName);}
      },
      panel:(pageName,contName,panelName)=>{
        if(!lazyModules.panels[pageName]){lazyModules.panels[pageName] = {};}
        if(!lazyModules.panels[pageName][contName]){lazyModules.panels[pageName][contName] = [];}
        if(lazyModules.panels[pageName][contName].indexOf(panelName) < 0){lazyModules.panels[pageName][contName].push(panelName);}
      }
    }
  },

  constants:['window.pageModules = {};'],

  add_css:(c)=>{css.push(c);},
  add_primary_function:(f)=>{primary_functions.push(f);},

  global:{
    add:{
      function:(n,d,s)=>{globals.functions.push({k:n,d:d,s:s});return true;},
      object:(n,d,s)=>{globals.objects.push({k:n,d:d});return true;},
      comp:(n,d,s)=>{globals.comps.push({k:n,d:d,s:s});return true;},
    }
  },

  get_id_num:()=>{
    last_id_num += 1;
    return last_id_num;
  },

  get_var_num:()=>{
    last_class_num += 1;
    return last_class_num;
  },

  base_href:base_href,

  finish:()=>{return built;},

  add_resolver:(r)=>{resolver = r;},
  add_title:(t)=>{pageTitle = t;},

  extract:{
    apis:(m)=>{
      let pool = [...m.matchAll("engine.[a-zA-Z.]+")],collect = [];
      for(let i of pool){collect.push(i.toString());}
      return collect;
    }
  },

  add_function:(m)=>{
    functions.push(m);
  },
  add_primary_function:(m)=>{
    primary_functions.push(m);
  },

  add_api:(a)=>{
    if(apis.indexOf(a) < 0){
      apis.push(a);
    }
  },
  add_apis:(p)=>{for(let a of p){
    if(apis.indexOf(a) < 0){
      apis.push(a);
    }
  }},

  element:{
    add:(element)=>{
      if(!children[element.parent]){children[element.parent] = [];}
      children[element.parent].push(element.id);
      elements[element.id] = element;
      return true;
    },
    get:(id)=>{return elements[id];},
    update:(id,element)=>{elements[id] = element;return true;},
    delete:(id)=>{delete elements[id];return true;}
  },

  meta:{
    add:(m)=>{metas[m.name] = m.content;},
    update:(m)=>{metas[m.name] = m.content;},
    delete:(n)=>{delete metas[n]},
  },

  publish:async ()=>{

    let map = builder.map.get();

    //--------------------------------------
    //make body

      //------------------------
      //make dom element structure
      make_structure_element("router");
      make_structure_element("page-loader");
      make_structure_element("page-router");
      children["router"] = ['page-loader','page-router'];
      let dom_tree = compile_element("router");

      //------------------------
      //build script
      let script = await require("./scriptify").init(map,build_type);

      //------------------------
      //build body
      let body = wrap_element("body",{},dom_tree+script);

    //--------------------------------------
    //make header

      //------------------------
      //build title
      let title = wrap_element("title",{},pageTitle);

      //------------------------
      //build meta tags
      let meta_collect = '';
      for(let meta in metas){
        meta_collect += wrap_element("meta",{name:`${meta}`,content:`${metas[meta]}`},null,true)
      }

      //------------------------
      //build css style
      let collect_css = '';
      collect_css += map.master_css;
      for(let c of css){collect_css += '\n' + c;}
      let master_css = wrap_element("style",{},collect_css);

      //------------------------
      //build find head element
      let head = wrap_element("head",{},title+meta_collect+master_css);

    //--------------------------------------
    //make html document
    let html = "<!DOCTYPE html>" + wrap_element("html",{},head+body);

    //--------------------------------------
    //publish and resolve
    built = html;
    resolver();

  }

};

function compile_element(id){
  let compiled_children = '';
  let element = elements[id];
  if(!element){return '';}
  if(element.text){compiled_children += element.text;}
  if(children[id]){
    for(let child of children[id]){
      compiled_children += compile_element(child);
    }
  }
  if(element.apis && element.apis.length > 0){
    for(let api of element.apis){
      apis.push(api);
    }
  }
  if(element.functions){
    for(let func of element.functions){
      builder.add_function(func);
    }
  }
  if(element.style){
    let collect_style = '';
    for(let style in element.style){
      collect_style += style + ':' + element.style[style] + ';';
    }
    element.options.style = collect_style;
  }
  let final = make_element(element,compiled_children);
  return final;
}

function make_element(element,children_pool){
  return wrap_element(element.tag,element.options,children_pool);
}

function wrap_element(tag,options,children,dont_close){
  let collect_options = '';
  for(let option in options){
    collect_options += " " + option + "=";
    let val = options[option];
    if(typeof(val) === "string"){
      collect_options += `"${val}"`
    } else if(typeof(val) === "number"){
      collect_options += `${val}`
    } else if(val === true || val === false){
      collect_options += `${val}`
    }
  }
  let make = `<${tag}${collect_options}>`;
  if(children){make += children;}
  if(!dont_close){
    make += `</${tag}>\n`;
  } else {make += "\n";}
  return make;
}

function make_structure_element(id){
  elements[id] = {
    tag:'div',
    options:{
      id:`${id}`,
      class:`${id}`
    }
  };
}

function parse_url(url){
  if(!url){return false;}
  let re = /(https|http):\/\/[www.]{0,4}(\w{3,63})\.(\w{2,63}):{0,1}(\d{0,5})\/{0,1}(.*)/g;
  let collect = [...url.matchAll(re)];
  if(!collect || collect.length === 0){return false;} else {return {
    protocol:collect[0][1],
    host:collect[0][2],
    tld:collect[0][3],
    port:collect[0][4],
    data:collect[0][5]
  };}
}
