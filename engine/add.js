
module.exports = {

  object : function(key,object){
    return builder.global.add.object(key,object);
  },

  function : function(key,object,static_path){
    return builder.global.add.function(key,object,static_path);
  },

  comp : function(key,object,add_to_static,static_path){
    if(!add_to_static){return true;}
    if(!static_path){return common.error("static path is required to add comp to page build.");}
    return builder.global.add.comp(key,object,static_path);
  }

};
