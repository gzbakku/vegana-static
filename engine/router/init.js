

function build(parent,type,mod,data,cls){

  let router_id;
  if(type == 'comp'){
    router_id = parent + '-router-' + engine.uniqid() + '-' + type;
  } else {
    router_id = parent + '-router-' + type;
  }

  engine.make.creator('div',{
    parent:parent,
    id:router_id,
    class:cls || 'router-' + type,
    only_id:true
  });

  let routerApp = engine.router;

  if(mod && type == 'comp'){
    routerApp.track.comp[router_id] = router_id + mod.ref;
    routerApp.built.comp.push(router_id + mod.ref);
    mod.init(router_id,data);
  }

  return router_id;

}

module.exports = {

  conts : function(parent,cls){
    return build(parent,'cont',null,null,cls);
  },

  panels : function(parent,cls){
    return build(parent,'panel',null,null,cls);
  },

  comps : function(parent,mod,data,cls){
    return build(parent,'comp',mod,data,cls);
  }

};
