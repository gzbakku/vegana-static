module.exports = {
  init:init
};

async function init(url,build_type){

  if(!build_type){build_type = 'required';}

  if(url === "--help" || url === "-h"){
    common.tell("url will be used to provide params for routing to the vegana api.");
    common.tell("url should be a valid url with ");
    common.tell("url : https://somewebsite.com/page1/cont1/panel1?param1=true&params2=false&param3=base64_encoded_string");
    console.log();
    common.tell("----------------------------");
    console.log();
    common.tell("valid build types are engine and bundle");
    common.tell("engine build will put the entire engine excluding bundle to built page.");
    common.tell("bundle build will put the entire bundle to built page.");
    common.tell("required build will put only required engine apis and there dependencies to built page.");
    return;
  }

  url = 'https://somecom.co/page1?p=true';

  while(true){
    if(!url || url.length < 1){
      url = input.text('please provide a valid url');
    } else {
      break;
    }
  }

  function check_url(){
    let re = /(https|http):\/\/(\w{3,63})\.(\w{2,63})\/{0,1}(.*)\?{0,1}(.*)/g;
    let collect = [...url.matchAll(re)];
    if(!collect || collect.length === 0){return false;} else {return {
      protocol:collect[0][1],
      host:collect[0][2],
      tld:collect[0][3],
      data:collect[0][4]
    };}
  }

  let built_types = ['engine','bundle','required'];
  if(build_type && build_type.length > 0){
    if(built_types.indexOf(build_type) < 0){
      common.error("invalid built type");
      build_type = await input.select('please provide a build type',['engine','bundle']);
    }
  }

  if(!check_url(url)){
    return common.error("invalid url");
  }


}
