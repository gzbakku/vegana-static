

module.exports = {

  panelModule:()=>{},

  baseHref:(l)=>{
    builder.add_function(l);
    builder.add_api("engine.router.set.baseHref");
  }

};
