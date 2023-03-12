var db = {};

module.exports = {

  get : function(tag,where){
    // builder.add_api("engine.data.get");
    return db[tag];
  },

  set : function(tag,value,where){
    // builder.add_api("engine.data.set");
    if(db[tag]){return false;}
    db[tag] = value;
    return true;
  },

  reset : function(tag,value,where){
    // builder.add_api("engine.data.reset");
    db[tag] = value;
    return true;
  },

  delete:(tag,where)=>{
    // builder.add_api("engine.data.delete");
    delete db[tag];
    return true;
  }

};
