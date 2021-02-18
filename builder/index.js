

let functions = [];
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

  get_class_num:()=>{
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

  element:{
    add:(element)=>{
      if(!children[element.parent]){children[element.parent] = [];}
      children[element.parent].push(element.id);
      elements[element.id] = element;
    },
    get:(id)=>{return elements[id];},
    update:(id,element)=>{elements[id] = element;}
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

    // functions.push("\nconsole.log('one');\n");
    // functions.push("\nconsole.log('two');\n");
    // functions.push("\nlet fs8d97f89789s7df897 = 'hello'\n");

    let functions_compile = '';
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

function compile_element(id){
  let compiled_children = '';
  if(children[id]){
    for(let child of children[id]){
      compiled_children += compile_element(child);
    }
  }
  let element = elements[id];
  if(element.functions){
    for(let func of element.functions){
      builder.add_function(func);
    }
  }
  if(element.tag === "div" && element.text){compiled_children += element.text;}
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
  make += `</${tag}>`;
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
