

module.exports = {
  init:init
};

async function init(host){

  common.tell("make sure your vegana project is building fine before running vegana-static server");
  common.tell("vegana-static server does not check validity of add in any possible way.");

  //run vegana build web
  let check_vegana_version = await cmd.run("vegana version").then(()=>{return true;}).catch(()=>{return false;});
  if(!check_vegana_version){
    common.tell("please install vegana via npm");
    common.tell("npm i -g vegana");
    common.tell("make sure you have installed vegana as a global npm module");
    return common.error("failed-check_vegana_version");
  }

  let build_vegana = await cmd.run(`vegana build web ${host}`).then(()=>{return true;}).catch(()=>{return false;});
  if(!build_vegana){
    return common.error("failed-build_vegana_app");
  }

  return true;

}
