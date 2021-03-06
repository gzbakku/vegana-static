const log = false;
const fetch = require("node-fetch");

module.exports = {

  send : async function(options){

    engine.common.tell('sending request',log);

    if(typeof(options) !== 'object'){
      return engine.common.error('invalid_options');
    }
    if(!options.body || !options.url){
      return engine.common.error('not_found-body/headers/url/method||options');
    }

    let build = {
      method:'get',
      body:JSON.stringify(options.body)
    };

    engine.common.tell('build configured',log);

    if(options.method){
      build['method'] = options.method;
    }
    //add header content type tag if doent exists for wet platform
    if(options.headers){
      build['headers'] = (options.headers);
      if(!options.headers['Content-Type']){
        if(typeof(options.body) == 'object'){
          build['headers']['Content-Type'] = 'application/json';
        }
      }
    }
    if(!options.headers){
      if(typeof(options.body) == 'object'){
        build['headers'] = {
          'Content-Type': 'application/json'
        }
      }
    }

    function reponseProcessor(str){
      try {
        return str.json();
      } catch (err) {
        return str;
      }
    }

    let worker = await fetch(options.url,build)
    .then((response)=>{
      if(typeof(response) == 'string'){
        return reponseProcessor(response);
      } else {
        let data = response.json();
        return data;
      }
    })
    .catch((error)=>{
      engine.common.error('request_error : ' + error);
      return engine.common.error('failed-request');
    });

    engine.common.tell('worker called',log);

    return worker;

  }

};
