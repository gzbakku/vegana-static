

module.exports = {

  panelModule:()=>{},

  baseHref:(l)=>{
    builder.constants.push(`window.baseHref = "${l}";`);
    builder.add_api("engine.router.set.baseHref");
  }

};
