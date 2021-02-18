
module.exports = {

  object : function(key,object){
    if(!key){
      return common.error('not_found-key');
    }
    if(!object){
      return common.error('not_found-object');
    }
    engine['global']['object'][key] = object;
    return true;
  },

  function : function(key,func){
    if(!key){
      return common.error('not_found-key');
    }
    if(!func){
      return common.error('not_found-func');
    }
    engine['global']['function'][key] = func;
    return true;
  },

  comp : function(key,mod){
    if(!key){
      return common.error('not_found-key');
    }
    if(!mod){
      return common.error('not_found-module');
    }
    engine['global']['comp'][key] = mod;
    return true;
  }

};
