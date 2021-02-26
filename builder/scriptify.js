

let router_added = false;

module.exports = {
  init:init
};

async function init(map,build_type){

  //--------------------------------------------------------------------------
  //mine lazyModules for engine api dependencies
  //have to be done before apis are collected from engine
  if(build_type === "required"){
    let lazyModules = builder.get.lazyModules();
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
  }

  //make central script
  let functions_compile = '';

  //start a async function in which all other functions will execute
  if(build_type === "engine"){
    functions_compile += "\n(async()=>{\n\n"
  }

  //this adds basic page requirements for engine to work
  if(build_type === "required" || build_type === "engine"){
    for(let i of builder.constants){functions_compile += '\n' + i + '\n'};
  }

  if(build_type === "required"){
    //this mine the api list for further engine api dependencies
    //this needs to be built before primary functions be added to function list
    let apis = builder.get.apis(),globals = builder.get.globals();
    mine_apis(apis,map);
    let build_primary_functions = await collect_apis(apis,globals,map);

    //add primary functions these are browserify dependnedcies that engine uses
    // let primary_functions = builder.get.primary_functions();
    // for(let func of primary_functions){functions_compile += '\n' + tabify_function_string(func," ") + '\n';}
    let primary_functions = builder.get.primary_functions();
    for(let func of primary_functions){functions_compile += '\n' + tabify_function_string(func," ") + '\n';}

    //this adds engine apis to function list
    functions_compile += build_primary_functions;
  }

  if(build_type === "engine"){
    //add engine as broserified module
    functions_compile += '\n' + map.packs.engine + '\n';
    functions_compile += `\nwindow.engine = Engine;\n`;
  }

  if(build_type === "bundle"){
    //add bundle as broserified module
    functions_compile += '\n' + map.packs.bundle + '\n';
  }

  //these are ruter contants used to navigate and only are added if router apis are included in function list
  if(router_added || build_type === "engine" || build_type === "bundle"){
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
  let functions = builder.get.functions();
  for(let func of functions){functions_compile += '\n' + tabify_function_string(func," ") + '\n';}

  if(build_type === "engine"){
    functions_compile += "\n\n})();\n"
  }

  //generate script
  return builder.wrap_element("script",{},functions_compile);

}

async function collect_apis(apis,globals,map){

  collect_engine_api_sub_dependensies(apis);

  let global_items = await add_global_items(' ',globals);

  let build = {};

  let clean = [];
  for(let api of apis){
    if(clean.indexOf(api) < 0){clean.push(api);}
  }

  for(let api of clean){
    let last = get_last(api);
    let func = get_api(api,map);
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

function get_last(api){
  let hold = api.split(".");
  return hold[hold.length-1];
}

//collect subdependencies from know vegana engine dependencies
function collect_engine_api_sub_dependensies(apis){
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

//removes tabs and inserts space accoding to given white space
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

//replaces white spaces with two spaces
function de_tabify_function_line(l){
  while(l.indexOf("\t") >= 0){
    l = l.replace("\t"," ");
  }
  return l;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/*

this takes vegana engine apis, convests those apis into text and organises them into a json object format

o is a object of sub objects with final values as functions

some apis which have depenedcies which are not in context are pre packaged with browserify and if those api matches the k are placed as browseify objects

l is the whitespace length

global_items are only provided once when the function is first called so global items can be added to base object.

*/
async function stringify_function_tree(o,l,global_items){
  let collect = '{';
  //this parses whiteSpace according to the l variable
  let whiteSpace = '';for(let i=0;i<l;i++){whiteSpace += ' ';}
  for(let k in o){
    //these apis are added as browserify depenedecies
    if(k === "creator" || k === "uniqid" || k === "view" || k === "data" || k === "router" || k === "loader" || k === "make"){
      let map = builder.map.get();
      //if router api is used then constant router nativator objects are added to the function tree
      //this can be found in init function
      if(k === 'router'){router_added = true;}
      builder.add_apis(builder.extract.apis(map.packs[k]));
      builder.add_primary_function(map.packs[k]);
      collect += '\n' + whiteSpace + k + ":" + capitalizeFirstLetter(k) + ','
    } else {
      if(typeof(o[k]) === "object"){
        //this calls the this sme function again and add those apis with additional whitespaces as objects to current object structure
        collect += '\n' + whiteSpace + k + ":" + await stringify_function_tree(o[k],l+1) + ',\n'
      } else {
        //this converts the function to text and add it to current object text with whitespace
        collect += '\n' + whiteSpace + k + ":" + tabify_function_string(o[k].toString(),whiteSpace) + ','
      }
    }
  }
  //these are vegana global objects ie comps objects and functions which are added via vegana.add.function or similar apis
  if(global_items){
    collect += '\n' + whiteSpace + "global:" + global_items + ',\n'
  }
  //finish the function without any closures
  collect += '\n' + whiteSpace + "}";
  return collect;
}

//parses vegana global objects like comps functions and objects to a json type object string
async function add_global_items(whiteSpace,globals){
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

//converts a valid json object into a packed object as string with whitespaces
async function objectify_global_objects(whiteSpace,pool){
  let make = '{';
  for(let object of pool){
    make += '\n' + whiteSpace + " " + `${object.k}` + ":" + `${JSON.stringify(object.d)}` + ","
  }
  make += '\n' + whiteSpace + '},';
  return make;
}

//converts function or compiles functions with dependencied to string and packs them into a json object type string.
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

/*
if static address is provided for gobal vegana function or component
then they are parsd with browserify and sends back a function as a string
*/
async function parse_global_item(data){
  if(!data.s){
    return data.f.toString();
  }
  let path = process.cwd() + "/" + data.s;
  let func_name = "f_" + builder.get_var_num();
  let func_pack = await builder.map.browserify(path,func_name)
  .then((d)=>{return d;}).catch(()=>{return false;});
  if(!func_pack){return engine.common.error("failed-make-func_pack")}
  builder.add_apis(builder.extract.apis(func_pack));
  // primary_functions.push(func_pack);
  builder.add_primary_function(func_pack);
  return func_name;
}

function mine_apis(apis,map){
  let collect = [];
  for(let api of apis){
    for(let a of builder.extract.apis(get_api(api,map).toString())){
      collect.push(a);
    }
  }
  for(let api of collect){
    for(let a of builder.extract.apis(get_api(api,map).toString())){
      collect.push(a);
    }
  }
  for(let a of collect){apis.push(a);}
}

function get_api(api,map){
  let pool = api.split(".");
  // let map = builder.map.get();
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
