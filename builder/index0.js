

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

  set:{
    url:(l)=>{url = l;},
    build_type:(l)=>{build_type = l;}
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

  get:()=>{return built;},

  add_resolver:(r)=>{resolver = r;},
  add_title:(t)=>{pageTitle = t;},

  extract:{
    apis:(m)=>{
      let pool = [...m.matchAll("engine.[a-zA-Z.]+")],collect = [];
      for(let i of pool){collect.push(i.toString());}
      return collect;
    }
  },
  init:require("./init"),
  map:require("./map"),
  start:require("./start"),

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

    //mine lazyModules for engine api dependencies
    //have to be done before apis are collected from engine
    for(let compName of lazyModules.globals){
      if(map.globals && map.globals[compName] && map.globals[compName].jsText){
        builder.add_apis(builder.extract.apis(map.globals[compName].jsText));
      }
    }
    for(let pageName of lazyModules.pages){
      if(map.pages && map.pages[pageName] && map.pages[pageName].jsText){
        builder.add_apis(builder.extract.apis(map.pages[pageName].jsText));
      }
    }
    for(let pageName in lazyModules.conts){
      for(let contName of lazyModules.conts[pageName]){
        if(map.conts && map.conts[pageName] && map.conts[pageName][contName] && map.conts[pageName][contName].jsText){
          builder.add_apis(builder.extract.apis(map.conts[pageName][contName].jsText));
        }
      }
    }
    for(let pageName in lazyModules.panels){
      for(let contName in lazyModules.panels[pageName]){
        for(let panelName of lazyModules.panels[pageName][contName]){
          if(
            map.panels && map.panels[pageName] && map.panels[pageName][contName] &&
            map.panels[pageName][contName][panelName] && map.panels[pageName][contName][panelName].jsText
          ){
            builder.add_apis(builder.extract.apis(map.panels[pageName][contName][panelName].jsText));
          }
        }//panels
      }//conts
    }//pages

    //make central dom
    make_structure_element("router");
    make_structure_element("page-loader");
    make_structure_element("page-router");
    children["router"] = ['page-loader','page-router'];
    let build = compile_element("router");

    //make central script
    let functions_compile = '';

    //this adds basic page requirements for engine to work
    for(let i of builder.constants){functions_compile += '\n' + i + '\n'};

    //this mine the api list for further engine api dependencies
    //this needs to be built before primary functions be added to function list
    mine_apis(apis);
    let build_primary_functions = await collect_apis();

    //add primary functions these are browserify dependnedcies that engine uses
    for(let func of primary_functions){functions_compile += '\n' + tabify_function_string(func," ") + '\n';}

    //this adds engine apis to function list
    functions_compile += build_primary_functions;

    //these are ruter contants used to navigate and only are added if router apis are included in function list
    if(router_added){
      functions_compile += `\nengine.router.active = ${JSON.stringify(engine.router.active)};\n`;
      functions_compile += `\nengine.router.track = ${JSON.stringify(engine.router.track)};\n`;
      functions_compile += `\nengine.router.built = ${JSON.stringify(engine.router.built)};\n`;
      functions_compile += "\nengine.router.closeures = ["
      for(let func of engine.router.closeures){
        functions_compile += `\n ${tabify_function_string(func.toString(),' ')},\n`;
      }
      functions_compile += "];"
    }

    //these are functions that built page uses to interact with user interface
    for(let func of functions){functions_compile += '\n' + tabify_function_string(func," ") + '\n';}

    //generate script
    let script = wrap_element("script",{},functions_compile);

    //make body
    let body = wrap_element("body",{},build+script);

    //make header
    let title = wrap_element("title",{},pageTitle);
    let meta_collect = '';
    for(let meta in metas){
      meta_collect += wrap_element("meta",{name:`${meta}`,content:`${metas[meta]}`})
    }

    //make css
    let collect_css = '';
    collect_css += map.master_css;
    for(let c of css){collect_css += '\n' + c;}
    let master_css = wrap_element("style",{},collect_css);
    //make head
    let head = wrap_element("head",{},title+meta_collect+master_css);

    //make html page
    let html = "<!DOCTYPE html>" + wrap_element("html",{},head+body);
    built = html;

    resolver();

  }

};

function get_last(api){
  let hold = api.split(".");
  return hold[hold.length-1];
}

async function collect_apis(){

  collect_engine_api_sub_dependensies();

  let global_items = await add_global_items(' ');

  let build = {};

  let clean = [];
  for(let api of apis){
    if(clean.indexOf(api) < 0){clean.push(api);}
  }

  for(let api of clean){
    let last = get_last(api);
    let func = get_api(api);
    let hold = build;
    for(let route of api.split(".")){
      if(!hold[route]){
        if(route === last){
          hold[route] = func;
        } else {
          hold[route] = {};
        }
      }
      hold = hold[route];
    }
  }

  let stringify = await stringify_function_tree(build.engine,1,global_items);

  let final = '\nwindow.engine=' + stringify + "\n";

  // console.log(stringify);

  return final;

}

function collect_engine_api_sub_dependensies(){
  let map = builder.map.get();
  for(let api of apis){
    if(api.indexOf("engine.creater") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.creater));
    } else if(api.indexOf("engine.uniqid") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.uniqid));
    } else if(api.indexOf("engine.view") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.view));
    } else if(api.indexOf("engine.data") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.data));
    } else if(api.indexOf("engine.router") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.router));
    } else if(api.indexOf("engine.loader") >= 0){
      builder.add_apis(builder.extract.apis(map.packs.loader));
    } else {
      let hold = map.engine;
      for(let route of api.split(".")){
        if(route !== "engine"){
          hold = hold[route];
        }
      }
      if(hold){
        builder.add_apis(builder.extract.apis(hold.toString()));
      }
    }
  }
}

function tabify_function_string(f,w){
  let collect = '';
  f = f.trim();
  let lines = f.split("\n");
  let first = lines[0];
  let last = lines[lines.length-1];
  for(let l of lines){
    l = de_tabify_function_line(l);
    if(l === first){
      collect += l;
    } else if(l === last){
      collect += "\n" + w + l;
    } else {
      collect += "\n" + w + ' ' + l;
    }
  }
  return collect;
}

function de_tabify_function_line(l){
  while(l.indexOf("\t") >= 0){
    l = l.replace("\t"," ");
  }
  return l;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function stringify_function_tree(o,l,global_items){
  let collect = '{';
  let whiteSpace = '';for(let i=0;i<l;i++){whiteSpace += ' ';}
  for(let k in o){
    if(k === "creator" || k === "uniqid" || k === "view" || k === "data" || k === "router" || k === "loader" || k === "make"){
      let map = builder.map.get();
      if(k === 'router'){router_added = true;}
      // console.log(builder.extract.apis(map.packs[k]));
      builder.add_apis(builder.extract.apis(map.packs[k]));
      primary_functions.push(map.packs[k]);
      collect += '\n' + whiteSpace + k + ":" + capitalizeFirstLetter(k) + ','
    } else {
      if(typeof(o[k]) === "object"){
        collect += '\n' + whiteSpace + k + ":" + await stringify_function_tree(o[k],l+1) + ',\n'
      } else {
        collect += '\n' + whiteSpace + k + ":" + tabify_function_string(o[k].toString(),whiteSpace) + ','
      }
    }
  }

  //add global function
  if(global_items){
    collect += '\n' + whiteSpace + "global:" + global_items + ',\n'
  }

  collect += '\n' + whiteSpace + "}";
  return collect;
}

async function add_global_items(whiteSpace){
  if(
    globals.functions.length === 0 &&
    globals.objects.length === 0 &&
    globals.comps.length === 0
  ){return '';}
  let make = whiteSpace + ' ' + '{';
  if(globals.functions.length > 0){
    make += '\n' + whiteSpace + "  function:" + await objectify_global_packed_functions(whiteSpace + '  ',globals.functions);
  }
  if(globals.comps.length > 0){
    make += '\n' + whiteSpace + "  comp:" + await objectify_global_packed_functions(whiteSpace + '  ',globals.comps);
  }
  if(globals.objects.length > 0){
    make += '\n' + whiteSpace + "  object:" + await objectify_global_objects(whiteSpace + '  ',globals.objects);
  }
  make += '\n' + whiteSpace + ' ' + "}"
  return make;
}

async function objectify_global_objects(whiteSpace,pool){
  let make = '{';
  for(let object of pool){
    make += '\n' + whiteSpace + " " + `${object.k}` + ":" + `${JSON.stringify(object.d)}` + ","
  }
  make += '\n' + whiteSpace + '},';
  return make;
}

async function objectify_global_packed_functions(whiteSpace,pool){
  let make = '{';
  for(let func of pool){
    let func_name = await parse_global_item(func);
    if(func_name){
      make += '\n' + whiteSpace + " " + `"${func.k}"` + ":" + `${func_name}` + ","
    }
  }
  make += '\n' + whiteSpace + '},';
  return make;
}

async function parse_global_item(data){
  if(!data.s){
    return data.f.toString();
  }
  let path = process.cwd() + "/" + data.s;
  let func_name = "f_" + builder.get_var_num();
  let func_pack = await builder.map.browserify(path,func_name)
  .then((d)=>{return d;}).catch(()=>{return false;});
  if(!func_pack){return engine.common.error("failed-make-func_pack")}
  // console.log(builder.extract.apis(func_pack));
  builder.add_apis(builder.extract.apis(func_pack));
  primary_functions.push(func_pack);
  return func_name;
}

function mine_apis(apis){
  let collect = [];
  for(let api of apis){
    for(let a of builder.extract.apis(get_api(api).toString())){
      collect.push(a);
    }
  }
  for(let api of collect){
    for(let a of builder.extract.apis(get_api(api).toString())){
      collect.push(a);
    }
  }
  for(let a of collect){apis.push(a);}
}

function get_api(api){
  let pool = api.split(".");
  let map = builder.map.get();
  let hold = map.engine;
  for(let i of pool){
    if(i !== "engine"){
      if(!hold[i]){
        return false;
      } else {
        hold = hold[i];
      }
    }
  }
  return hold;
}

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

function wrap_element(tag,options,children){
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
  make += `</${tag}>\n`;
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
