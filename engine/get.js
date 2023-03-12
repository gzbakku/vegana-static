module.exports = {

  os:()=>{return 'unknown';},

  host:()=>{
    return window.location.hostname;
  },

  element:(id)=>{return false;},

  platform:(data)=>{
    if(data === "static"){return true;}
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

    if(
      builder.map.get().panels &&
      builder.map.get().panels[pageName] &&
      builder.map.get().panels[pageName][contName] &&
      builder.map.get().panels[pageName][contName][panelName] &&
      builder.map.get().panels[pageName][contName][panelName].js
    ){
      return builder.map.get().panels[pageName][contName][panelName].js;
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
