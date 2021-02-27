

function fetch(){

  let params = {};

  let url = builder.get.url();

  if (/\?(.+?\=.+){1}/.test(url)) {
    url.split('?')[1].split('&').forEach(function(both){
      var e = both.split('=');
      params[e[0]] = e[1];
    });
  }

  return params;

}

module.exports = {

  get : fetch,

  add:(key,val)=>{return true;},

  delete:(key)=>{return true;},

  native:{

    get:()=>{

      let result = {
        page:null,
        cont:null,
        panel:null,
        custom:[],
        params:fetch()
      };

      let url = builder.get.url();
      if(url && url.data){url = url.data;}

      let parsed = builder.parse_url(url);
      if(parsed){url = parsed.data;} else {return false;}

      if(url.indexOf("?") >= 0){
        url = url.split("?")[0];
      }

      let natives = url.split('/');

      if(natives.length == 0){
        return result;
      }
      if(natives[0].length == 0){
        delete natives.splice(0,1);
      }
      if(natives[0]){
        result.page = natives[0] + 'Page';
        natives.splice(0,1);
      }
      if(natives[0]){
        result.cont = natives[0] + 'Cont';
        natives.splice(0,1);
      }
      if(natives[0]){
        result.panel = natives[0] + 'Panel';
        natives.splice(0,1);
      }
      if(natives.length > 0){
        result.custom = natives;
      }

      return result;

    },

    push:(data)=>{return true;}

  }

}
