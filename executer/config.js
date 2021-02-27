

module.exports = {
  init:init
};

async function init(){

  let cwd = await io.dir.cwd();
  let file_path = cwd + "/static_config.json";
  if(await io.exists(file_path)){
    return common.error("static_file already exists => " + file_path);
  }

  let app_dir = await io.dir.app();
  let from_path = app_dir + "/static_config.json";


  if(!io.copy(from_path,file_path)){
    return common.error("failed-generate-vegana-static_config_file");
  }

  return common.success("vegana static config file generated successfully.");

}
