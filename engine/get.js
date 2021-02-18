module.exports = {

  os:()=>{return 'unknown';},

  host:()=>{
    return window.location.hostname;
  },

  element:(id)=>{return false;},

  platform:(data)=>{
    if(data && data !== "static"){return false;}
    if(!data){return 'static';}
  },

  pageModule : function(pageName){
    if(window.pageModules[pageName]){
      return window.pageModules[pageName];
    } else if(!window.pageModules[pageName]) {
      return builder.map.get().pages[pageName];
    } else {return null;}
  },

  contModule : function(pageName,contName){
    let pool = window.pageModules[pageName].contModules;
    if(pool[contName]){
      return pool[contName];
    } else {
      return false;
    }
  },

  panelModule : function(pageName,contName,panelName){

    let pool = window.pageModules[pageName].contModules[contName].panelModules[panelName];
    if(pool){
      return pool;
    } else {
      return false;
    }

  },

  rowByTdId : function(id){return false;},

  divIdByEvent : function(e){return false;},

  body : {

    width : function(){
      return false;
    },

    height : function(){
      return false;
    }

  },

};
