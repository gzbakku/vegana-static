module.exports = {
  init:init
};

async function init(url,build_type,write_path){

  global.exit_on_error = true;

  let startTime = new Date().getTime();

  if(!url){url = ' ';}
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

  // url = 'https://www.somecom.co:4200/page1?p=true';

  while(true){
    let validate_url = builder.parse_url(url);
    if(validate_url){break;}
    if(!url || url.length < 1 || !validate_url){
      url = await input.text('please provide a valid url');
      if(!builder.parse_url(url)){
        common.error("please provide a valid url");
      }
    } else {
      break;
    }
  }

  let built_types = ['engine','bundle','required'];
  if(build_type && build_type.length > 0){
    if(built_types.indexOf(build_type) < 0){
      common.error("invalid built type");
      build_type = await input.select('please provide a build type',['engine','bundle']);
    }
  }

  let parse_url = builder.parse_url(url);
  if(!parse_url){
    return common.error("invalid url");
  }

  window.location = {};
  window.location.href = url;
  window.location.port = parse_url.port;
  window.location.protocol = parse_url.protocol + ':';
  window.location.hostname = `${parse_url.host}.${parse_url.tld}`;
  window.location.pathname = parse_url.data;

  builder.set.url(url);
  builder.set.build_type(build_type);

  // console.log(parse_url);

  let vegana_map = await builder.map.init();
  if(!vegana_map){
    return common.error("failed build map");
  }

  let build = await builder.start.init().then(()=>{return true;}).catch(()=>{return false;});
  if(!build){
    return common.error("failed build start");
  }

  if(!write_path){
    console.log(builder.finish());
    return;
  }

  if(!io.write(write_path,builder.finish())){
    return common.error("failed-write_to_file");
  }

  common.tell("page built");

}
