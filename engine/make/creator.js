
module.exports = maker;

function maker(tag,options){

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
      i !== 'options' &&
      i !== 'parent' &&
      i !== 'tag' &&
      i !== 'list_id' &&
      i !== 'id' &&
      i !== 'touch' &&
      i !== 'timer' &&
      i !== "only_id" &&
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
    if((tag == 'input' || tag == 'textarea' || tag === "select") && options.type !== 'button'){
      default_event = 'input'
      if(options.type === "number"){
        default_function = `"${element.id}",Number(${element_name}.value),${JSON.stringify(options.functionData)},event`;
      } else if(options.type === "file"){
        default_function = `"${element.id}",${element_name}.files,${JSON.stringify(options.functionData)},event`;
      } else if(options.type === "checkbox"){
        default_function = `"${element.id}",${element_name}.checked,${JSON.stringify(options.functionData)},event`;
      } else if(options.type === "select"){
        default_event = 'click';
        default_function = `"${element.id}",${element_name}.change,${JSON.stringify(options.functionData)},event`;
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
  if(options.touch){
    make_e_var();
    extract_apis(options.touch);
    let touch_id = get_touch_function_id();
    element.functions.push(`
      ${touch_id}("${element.id}",${element_name},${options.touch},${JSON.stringify(options.data)});
    `);
  }
  if(options.expire){
    let expire_id = get_expire_function_id();
    element.functions.push(`
      ${expire_id}("${element.id}",${options.expire});
    `);
  }
  if(options.timer){
    make_e_var();
    extract_apis(options.timer.function);
    let timer_id = get_timer_function_id();
    element.functions.push(`
      ${timer_id}(
        "${element.id}",
        ${element_name},
        ${JSON.stringify(options.timer.functionData || options.timer.data)},
        ${options.timer.time},
        ${options.timer.function}
      );
    `);
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

  if(tag === "select"){
    for(let opt of options.options){
      maker("option",{
        text:opt.text,
        value:opt.value,
        parent:element.id
      });
    }
  }

  return element.id;

}

let timer_function_id;
function get_timer_function_id(){
  if(timer_function_id){return timer_function_id;}
  timer_function_id = "i_" + builder.get_var_num();
  builder.add_primary_function(`
    let ${timer_function_id} = ${timer_function.toString()};
  `);
  return timer_function_id;
}

let expire_function_id;
function get_expire_function_id(){
  if(expire_function_id){return expire_function_id;}
  expire_function_id = "i_" + builder.get_var_num();
  builder.add_primary_function(`
    let ${expire_function_id} = ${expireFunction.toString()};
  `);
  return expire_function_id;
}

let touch_function_id;
function get_touch_function_id(){
  if(touch_function_id){return touch_function_id;}
  touch_function_id = "i_" + builder.get_var_num();
  builder.add_primary_function(`
    let ${touch_function_id} = ${touch_function.toString()};
  `);
  return touch_function_id;
}

const expireFunction = (id,time)=>{
  setTimeout(()=>{
    engine.view.remove(id);
  }, time);
}

const timer_function = (id,object,data,time,func)=>{
  let timer_started = false,timer_timeout;
  object.addEventListener("mousedown",(eve)=>{
    timer_started = true;
    timer_timeout = setTimeout(function(){
      timer_started = false;
      func(id,data);
    }, time);
  });
  object.addEventListener("mouseout",(eve)=>{
    if(!timer_started){return;} else {
      clearTimeout(timer_timeout);
    }
  });
  object.addEventListener("mouseup",(eve)=>{
    if(!timer_started){return;} else {
      clearTimeout(timer_timeout);
    }
  });
}

const touch_function = (id,object,func,data)=>{
  let startTime;
  if(typeof(func) == "function"){
    let startX,startY,lastX,lastY;
    object.addEventListener("touchstart",(eve)=>{
      x = eve.touches[0].clientX,y = eve.touches[0].clientY;
      startX = x;startY = y;
      startTime = new Date().getTime();
    });
    object.addEventListener("touchmove",(eve)=>{
      eve.preventDefault();
      x = eve.touches[0].clientX,y = eve.touches[0].clientY;
      if(!lastX || !lastY){lastX = x,lastY = y;return;}
      const process = process_move(startX,startY,x,y,"continue",startTime);
      lastX = process.posX,lastY = process.posY;
      func(id,process,eve,data);
    });
    object.addEventListener("touchend",(eve)=>{
      if(!startX || !startY){startX = lastX,startY = lastY;return;}
      const process = process_move(startX,startY,lastX,lastY,"end",startTime);
      func(id,process,eve,data);
    });
    object.addEventListener("mousedown",(eve)=>{
      startX = eve.clientX;startY = eve.clientY;
      startTime = new Date().getTime();
      document.addEventListener("mousemove",move);
      document.addEventListener("mouseup",end);
    });
    const move = (eve)=>{
      x = eve.clientX,y = eve.clientY;
      if(!lastX || !lastY){lastX = x,lastY = y;return;}
      const process = process_move(startX,startY,x,y,"continue",startTime);
      lastX = process.posX,lastY = process.posY;
      func(id,process,eve,data);
    };
    const end = (eve)=>{
      if(!startX || !startY){startX = lastX,startY = lastY;return;}
      const process = process_move(startX,startY,lastX,lastY,"end",startTime);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      func(id,process,eve,data);
    };
  }
  function process_move(lastX,lastY,x,y,type,startTime){
    let dirX = 'left',dirY = 'up',
    diffX = x - lastX,diffY = y - lastY,
    perc_x = Math.ceil((Math.abs(diffX) / screen.width) * 100),
    perc_y = Math.ceil((Math.abs(diffY) / screen.height) * 100);
    if(diffY === 0){dirY = 'none';}
    if(diffY > 0){dirY = 'down';}
    if(diffY < 0){dirY = 'up';}
    if(diffX === 0){dirX = 'none';}
    if(diffX > 0){dirX = 'right';}
    if(diffX < 0){dirX = 'left';}
    let now = new Date().getTime();
    let time_diff = now - startTime;
    let collect = {
      type:type,
      dirX:dirX,dirY:dirY,
      moveX:Math.abs(diffX),moveY:Math.abs(diffY),
      posX:x,posY:y,
      basePosX:lastX,
      basePosY:lastY,
      percX:perc_x,percY:perc_y,
      time:time_diff
    };
    return collect;
  }
}
