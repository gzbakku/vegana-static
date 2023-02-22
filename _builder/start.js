


module.exports = {
  init:init
};

async function init(){

  const cwd = await io.dir.cwd();
  const app_location = cwd + "/app/index.js";

  let promise = new Promise((resolve,reject)=>{
    builder.add_resolver(resolve);
  });

  require(app_location);

  return promise;

}
