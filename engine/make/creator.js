
module.exports = (tag,options)=>{

  let collect_options = {};
  for(var i in options){
    if(
      i !== 'function' &&
      i !== 'functionData' &&
      i !== 'events' &&
      i !== 'event' &&
      i !== 'text' &&
      i !== 'style' &&
      i !== 'data' &&
      i !== 'parent' &&
      i !== 'tag' &&
      i !== 'list_id' &&
      i !== 'id' &&
      i !== 'draw'
    ){
      collect_options[i] = options[i];
    }
  }

  let element = {
    tag:tag,
    parent:options.parent,
    options:{},
    functions:[],
    apis:[]
  };

  if(options.text){element.text = options.text;}

  if(options.id){
    if(options.only_id){
      element.id = options.id;
    } else {
      element.id = element.parent + "-" + options.id;
    }
  } else {
    // element.id = element.parent + "-" + engine.uniqid();
    element.id = element.parent + "-" + builder.get_id_num();
  }
  collect_options.id = `${element.id}`;

  // let element_name = 'i_' + engine.md5(element.id);
  let element_name = 'i_' + builder.get_var_num();

  let e_made = false;
  function make_e_var(){
    if(e_made){return true;}
    element.functions.push(`
      let ${element_name} = document.getElementById("${element.id}");
    `);
    e_made = true;
  }

  function extract_apis(f){
    for(let api of builder.extract.apis(f.toString())){
      if(element.apis.indexOf(api) < 0){element.apis.push(api);}
    }
  }

  if(options.function){
    let default_event = 'click';
    let default_function = `"${element.id}",${JSON.stringify(options.functionData)},event`;
    if((tag == 'input' || tag == 'textarea') && options.type !== 'button'){
      default_event = 'input'
      if(options.type === "number"){
        default_function = `"${element.id}",Number(${element_name}.value),${JSON.stringify(options.functionData)},event`;
      } else if(options.type === "file"){
        default_function = `"${element.id}",${element_name}.files,${JSON.stringify(options.functionData)},event`;
      } else {
        default_function = `"${element.id}",${element_name}.value,${JSON.stringify(options.functionData)},event`;
      }
    }
    extract_apis(options.function);
    make_e_var();
    element.functions.push(`
      if(${element_name}){
        ${element_name}.addEventListener("${default_event}",(event)=>{
          let func = ${options.function.toString()};
          func(${default_function});
        });
      }
    `);
  }

  function add_event(e,d,f){
    extract_apis(f);
    element.functions.push(`
      if(${element_name}){
        ${element_name}.addEventListener("${e}",(event)=>{
          let func = ${f.toString()};
          func("${element.id}",${JSON.stringify(d)},event);
        });
      }
    `);
  }

  if(options.events){
    make_e_var();
    for(let e of options.events){
      add_event(e.event,e.data || e.functionData,e.function);
    }
  }
  if(options.event){
    make_e_var();
    add_event(options.event.type, options.event.data || options.event.functionData, options.event.function);
  }

  if(options.draw){
    let draw,platform = 'pc';
    if(options.draw.all){
      draw = options.draw.all;
    }
    if(platform === "pc" && options.draw.browser){
      if(options.draw.browser.pc){
        reduce_draw(draw,options.draw.browser.pc);
      }
    }
    if(platform === "mobile" && options.draw.browser){
      if(options.draw.browser.mobile){
        reduce_draw(draw,options.draw.browser.mobile);
      }
    }
    if(platform === "cordova" && options.draw.cordova){
      if(options.draw.cordova.all){
        reduce_draw(draw,options.draw.cordova.all);
      }
      if(os==="ios" && options.draw.cordova.ios){
        reduce_draw(draw,options.draw.cordova.ios);
      }
      if(os==="android" && options.draw.cordova.android){
        reduce_draw(draw,options.draw.cordova.android);
      }
    }
    if(platform === "electron" && options.draw.electron){
      if(options.draw.electron.all){
        reduce_draw(draw,options.draw.electron.all);
      }
      if(os==="windows" && options.draw.electron.windows){
        reduce_draw(draw,options.draw.electron.windows);
      }
      if(os==="linux" && options.draw.electron.linux){
        reduce_draw(draw,options.draw.electron.linux);
      }
      if(os==="mac" && options.draw.electron.mac){
        reduce_draw(draw,options.draw.electron.mac);
      }
    }
    // collect_options.style = draw_as_string(draw);
    element.style = draw;
  }
  function reduce_draw(base,next){
    for(let k in next){
      if(next[k] === false){delete base[k];} else if(typeof(next[k]) === "string"){base[k] = next[k];}
    }
  }
  function draw_as_string(final){
    let collect = '';
    for(let k in final){
      collect += k + ":" + final[k] + ";"
    }
    return collect;
  }

  element.options = collect_options;

  builder.element.add(element);

  return element.id;

}
