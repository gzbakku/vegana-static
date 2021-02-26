
function toWorker(app,type,reset,routerId,data){

  const log = false;

  engine.common.tell("navigation initiated",log);
  engine.common.tell(`reinitiate module : ${reset}`,log);

  //other modules
  let router = engine.router;
  let view = engine.view;

  //catalogs
  let active = engine.router.active;
  let built = engine.router.built;
  let route = engine.router.route;
  let track = engine.router.track;
  let mods = engine.router.mods;

  engine.common.tell("router objects localised",log);

  //check if there is a initiated page heres
  if(type == 'page'){
    if(active[type] == null){
      return engine.common.error('no_page_initiated_from_app_starter');
    }
  }

  engine.common.tell("base page intiation validated",log);

  //security checks
  if(app == null || app == undefined){
    return engine.common.error('not_found-app');
  }
  if(app.ref == null || app.ref == undefined){
    return engine.common.error('invalid_app');
  }
  if(type == 'comp'){
    if(!routerId){
      return engine.common.error('not_found-routerId');
    }
  }

  engine.common.tell("module checks completed",log);

  //set ref here
  let toId;
  if(type == 'page'){
    toId = app.ref;
  } else if(type == 'cont'){
    toId = active.page + '-router-cont' + app.ref;
  } else if(type == 'panel'){
    let page = active.page + '-router-cont';
    let cont = track.cont[page];
    toId = cont + '-router-panel' + app.ref;
  } else if(type == 'comp'){
    toId = routerId + app.ref;
  }

  engine.common.tell("module ref built",log);

  if(reset == true){
    if(builder.element.get(toId)){
      builder.element.delete(toId)
      while(built[type].indexOf(toId) >= 0){
        let toIdPos = built[type].indexOf(toId);
        if(toIdPos >= 0){
          built[type].splice(toIdPos, 1);
        }
      }
    }
  }

  engine.common.tell("pre-built module removed",log);

  if(type == 'page'){
    view.hide(active.page);
  } else if(type == 'cont'){
    let page = active.page + '-router-cont';
    let cont = track.cont[page];
    view.hide(cont);
  } else if(type == 'panel'){
    let page = active.page + '-router-cont';
    let cont = track.cont[page] + '-router-panel';
    let panel = track.panel[cont];
    view.hide(panel);
  } else if(type == 'comp'){
    view.hide(track['comp'][routerId]);
  }

  engine.common.tell("active module hidden",log);

  //update track catalog with toId
  if(type == 'page'){
    active[type] = toId;
  } else if(type == 'cont'){
    let page = active.page + '-router-cont';
    track.cont[page] = toId;
    active[type] = toId;
  } else if(type == 'panel'){
    let page = active.page + '-router-cont';
    let cont = track.cont[page] + '-router-panel';
    track.panel[cont] = toId;
    active[type] = toId;
  } else if(type == 'comp'){
    track.comp[routerId] = toId;
  }

  engine.common.tell("to-module cataloged",log);

  //navigate here
  if(type == 'page'){
    route.push({type:type,id:toId,url:null,mod:app});
  } else if(type == 'cont'){
    route.push({type:type,id:toId,url:null,mod:app});
  } else if(type == 'panel'){
    route.push({type:type,id:toId,url:null,mod:app});
  }

  if(app.trackers){
    let trackers = app.trackers;
    if(trackers.title){
      engine.set.pageTitle(trackers.title);
    }
    if(trackers.meta){
      for(var i in trackers.meta){
        engine.meta.update(trackers.meta[i]);
      }
    }
    if(trackers.function){
      trackers.function(trackers.functionData || trackers.data || trackers.function_data);
    }
  }

  //already built the app
  if(built[type].indexOf(toId) >= 0 && document.getElementById(toId)){
    view.show(toId);
  }

  //app not built yet
  if(built[type].indexOf(toId) < 0 || !document.getElementById(toId)){

    //initiate app
    if(type == 'page'){
      app.init(data);
    } else if(type == 'cont'){
      let page = active.page + '-router-cont';
      app.init(page,data);
    } else if(type == 'panel'){
      let page = active.page + '-router-cont';
      let cont = track.cont[page] + '-router-panel';
      app.init(cont,data);
    } else if(type == 'comp'){
      app.init(routerId,data);
    }

    if(type == 'comp'){
      built[type].push(toId);
    }

    engine.common.tell("to-module built",log);

  }

  engine.common.tell("to-module router tags pushed",log);

  return true;

}



module.exports = {

  to : {
    page : function(app,data){
      if(engine.router.active.page == app.ref){
        return true;
      }
      return toWorker(app,'page',false,null,data);
    },
    cont : function(app,data){
      let parse = engine.router.active.page + '-router-cont' + app.ref;
      if(engine.router.active.cont == parse){
        return true;
      }
      return toWorker(app,'cont',false,null,data);
    },
    panel : function(app,data){
      let parse = engine.router.active.cont + '-router-panel' + app.ref;
      if(engine.router.active.panel == parse){
        return true;
      }
      return toWorker(app,'panel',false,null,data);
    },
    comp : function(app,data,routerId){
      return toWorker(app,'comp',false,routerId,data);
    }
  },

  new : {
    page : function(app,data){
      return toWorker(app,'page',true,null,data);
    },
    cont : function(app,data){
      return toWorker(app,'cont',true,null,data);
    },
    panel : function(app,data){
      return toWorker(app,'panel',true,null,data);
    },
    comp : function(app,data,routerId){
      return toWorker(app,'comp',true,routerId,data);
    }
  }

}
