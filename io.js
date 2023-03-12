const fs = require("node:fs/promises");
const fssync = require("node:fs");

module.exports = {

  exists:async (path)=>{
    let access = false;
    let stats;
    try{
      stats = await fssync.lstatSync(path);
    } catch(e){
      access = false;
    }
    if(typeof(stats) === "object"){
      if(stats.isFile()){access = true;}
    }
    return access;
  },

  read:(location,raw)=>{
    let op;
    if(!raw){op = { encoding: 'utf8' };}
    return fs.readFile(location,op)
    .then((data)=>{
      return data;
    })
    .catch((err)=>{
      console.error(err);
      return false;
    });
  },

  write:(location,data)=>{
    // return fs.writeFile(location,data,'utf-8')
    // .then(()=>{
    //   return true;
    // })
    // .catch((err)=>{
    //   common.error(err);
    //   return common.error("failed-write-io");
    // });
  },

  dir:{
    cwd:()=>{
      return io.clean_path(process.cwd());
    },
  },

  clean_path:clean_path

};

function clean_path(p){
  while(p.indexOf("\\") >= 0){
    p = p.replace('\\','/');
  }
  return p;
}
