

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

module.exports = {

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

  add_api:(a)=>{
    if(apis.indexOf(a) < 0){
      apis.push(a);
    }
  },
  add_apis:(p)=>{for(let a of p){apis.push(a);}},

  element:{
    add:(element)=>{
      if(!children[element.parent]){children[element.parent] = [];}
      children[element.parent].push(element.id);
      elements[element.id] = element;
      return true;
    },
    get:(id)=>{return elements[id];},
    update:(id,element)=>{elements[id] = element;return true;}
  },

  meta:{
    add:(m)=>{metas[m.name] = m.content;},
    update:(m)=>{metas[m.name] = m.content;},
    delete:(n)=>{delete metas[n]},
  },

  publish:()=>{

    let map = builder.map.get();

    make_structure_element("router");
    make_structure_element("page-loader");
    make_structure_element("page-router");
    children["router"] = ['page-loader','page-router'];

    let build = compile_element("router");

    let functions_compile = '';

    mine_apis(apis);
    let build_primary_functions = collect_apis();

    for(let func of primary_functions){functions_compile += '\n' + func + '\n';}

    functions_compile += build_primary_functions;
    for(let func of functions){functions_compile += '\n' + func + '\n';}

    let script = wrap_element("script",{},functions_compile);

    let body = wrap_element("body",{},build+script);

    let title = wrap_element("title",{},pageTitle);
    let meta_collect = '';
    for(let meta in metas){
      meta_collect += wrap_element("meta",{name:`${meta}`,content:`${metas[meta]}`})
    }
    let master_css = wrap_element("style",{},map.master_css);
    let head = wrap_element("head",{},title+meta_collect+master_css);
    let html = "<!DOCTYPE html>" + wrap_element("html",{},head+body);
    built = html;

    // console.log(html);

    resolver();

  }

};

function get_last(api){
  let hold = api.split(".");
  return hold[hold.length-1];
}

function collect_apis(){

  let build = {};

  for(let api of apis){
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

  let stringify = stringify_function_tree(build.engine,1);

  let final = '\nwindow.engine=' + stringify + "\n";

  // console.log(stringify);

  return final;

}

function tabify_function_string(f,w){
  let collect = '';
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

function stringify_function_tree(o,l){
  let collect = '{';
  let whiteSpace = '';for(let i=0;i<l;i++){whiteSpace += ' ';}
  for(let k in o){
    if(typeof(o[k]) === "object"){
      collect += '\n' + whiteSpace + k + ":" + stringify_function_tree(o[k],l+1) + ',\n'
    } else {
      if(k === "creator" || k === "uniqid"){
        let map = builder.map.get();
        // if(k === 'uniqid'){console.log(map.packs[k]);}
        primary_functions.push(map.packs[k]);
        collect += '\n' + whiteSpace + k + ":" + capitalizeFirstLetter(k) + ','
      } else {
        collect += '\n' + whiteSpace + k + ":" + tabify_function_string(o[k].toString(),whiteSpace) + ','
      }

    }
  }
  collect += '\n' + whiteSpace + "}"
  return collect;
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
