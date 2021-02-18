async function build(type,id,parent,cls){

  engine.make.div({
    only_id:true,
    id:id,
    parent:parent,
    class:cls
  });

  if(type == 'page' && !engine.router.active.page){
    let hold = id.split('-')[1] + 'Page';
    let app = engine.get.pageModule(hold);
    if(app){
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
          if(trackers.function_data){
            trackers.function(trackers.function_data);
          } else {
            trackers.function();
          }
        }
      }
    }
  }

  if(type == 'page'){
    engine.router.built.page.push(id);
    engine.router.active.page = id;
  } else if(type == 'cont'){
    engine.router.built.cont.push(id);
    engine.router.active.cont = id;
    engine.router.track.cont[parent] = id;
  } else if(type == 'panel'){
    engine.router.built.panel.push(id);
    engine.router.active.panel = id;
    engine.router.track.panel[parent] = id;
  }

  return id;

}

module.exports = {

  page : function(id,cls){
    return build('page',id,'page-router',cls);
  },

  comp : function(id,parent,cls){
    return build('comp',id,parent,cls);
  },

  cont : function(id,parent,cls){
    return build('cont',id,parent,cls);
  },

  panel : function(id,parent,cls){
    return build('panel',id,parent,cls);
  }

}
