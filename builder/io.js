const fs = require('fs-extra');
const fs_native = require("fs/promises");
const get_npm_root = require("get_npm_root");

module.exports = {

  exists:async (location)=>{
    if(!location){return false;}
    return fs.exists(location);
  },

  dir:{
    cwd:()=>{
      return io.clean_path(process.cwd());
    },
    app_dir:async ()=>{
      let base = await get_npm_root();
      base += "/vegana"
      return base;
    },
    app:async ()=>{
      let base = await get_npm_root();
      base += "/vegana/bin"
      return base;
    },
    app_old:()=>{
      let scriptAddressRef = process.argv[1];
      if(scriptAddressRef.length === 0){return '';}
      while(scriptAddressRef.indexOf("\\") >= 0){
        scriptAddressRef = scriptAddressRef.replace('\\','/');
      }
      let scriptMidPoint = scriptAddressRef.lastIndexOf("/");
      let clean = scriptAddressRef.substring(0,scriptMidPoint);
      let hold = clean.split("/");
      if(hold[hold.length - 1] !== "bin"){clean += "/bin";}
      return clean;
    },
    ensure:async (location)=>{
      // if(await io.exists(location)){
      //   return true;
      // }
      return fs.ensureDir(location)
      .then(()=>{
        return true;
      })
      .catch((err)=>{
        common.error(err)
        return common.error('failed-ensure-dir-io');
      });
    },
    create:(location)=>{
      return fs.mkdir(location)
      .then(()=>{
        return true;
      })
      .catch((err)=>{
        common.error(err)
        return common.error('failed-create-dir-io');
      });
    }
  },

  copy:async (from,to)=>{
    return fs.copy(from,to)
    .then(()=>{
      return true;
    })
    .catch((error)=>{
      common.error(error);
      return common.error("failed-copy-io");
    });
  },

  readJson:async (location,if_no_string_return_true_bool)=>{
    let run = await fs.readFile(location,'utf-8')
    .then((data)=>{
      return data;
    })
    .catch((err)=>{
      common.error(err);
      return common.error("failed-readJson-io");
    });
    if(
      typeof(run) === "string" &&
      run.length === 0 &&
      if_no_string_return_true_bool
    ){return true;}
    if(run){
      return JSON.parse(run);
    } else {
      return false;
    }
  },

  read:(location)=>{
    return fs.readFile(location,'utf-8')
    .then((data)=>{
      return data;
    })
    .catch((err)=>{
      common.error(err);
      return common.error("failed-read_file-io");
    });
  },

  write:(location,data)=>{
    return fs.writeFile(location,data,'utf-8')
    .then(()=>{
      return true;
    })
    .catch((err)=>{
      common.error(err);
      return common.error("failed-write-io");
    });
  },

  delete:(location)=>{
    return fs.remove(location)
    .then(()=>{
      return true;
    })
    .catch((e)=>{
      common.error(e);
      return false;
    });
  },

  rename:(from,to)=>{
    return fs_native.rename(from,to)
    .then(()=>{
      return true;
    })
    .catch((e)=>{
      common.error(e);
      return false;
    });
  },

  lazy:{

    read:async ()=>{
      return io.readJson(await getLazyFilePath());
    },

    write:async (data)=>{
      if(typeof(data) === "object"){data = JSON.stringify(data,null,2);}
      return io.write(await getLazyFilePath(),data);
    }

  },

  package:{

    read:async ()=>{
      return io.readJson(await getPackageFilePath());
    },

    write:async (data)=>{
      if(typeof(data) === "object"){data = JSON.stringify(data,null,2);}
      return io.write(await getPackageFilePath(),data);
    }

  },

  clean_path:clean_path,

  browse_dir:browse_dir,

  get_dir_items:get_dir_items,

  get_sub_dir:get_sub_dir,

  get_base_dir:get_base_dir

};

function clean_path(p){
  while(p.indexOf("\\") >= 0){
    p = p.replace('\\','/');
  }
  return p;
}

async function getLazyFilePath(){

  let currentDirectory = process.cwd(),lazyPath = '';
  while(currentDirectory.indexOf("\\") >= 0){
    currentDirectory = currentDirectory.replace("\\","/");
  }
  if(!currentDirectory.match('app')){
    if(await io.exists(currentDirectory + "/lazy.json")){
      return currentDirectory + "/lazy.json";
    }
    return common.error('invalid-project_directory');
  }
  let locationArray = currentDirectory.split('/');
  let appIndex = locationArray.indexOf('app');
  for(var i=0;i<appIndex;i++){
    let pathComp = locationArray[i];
    lazyPath = lazyPath + pathComp + '/';
  }
  lazyPath = lazyPath + 'lazy.json';
  return lazyPath;
}

async function getPackageFilePath(){

  let currentDirectory = process.cwd(),lazyPath = '';
  while(currentDirectory.indexOf("\\") >= 0){
    currentDirectory = currentDirectory.replace("\\","/");
  }
  if(!currentDirectory.match('app')){
    if(await io.exists(currentDirectory + "/package.json")){
      return currentDirectory + "/package.json";
    }
    return common.error('invalid-project_directory');
  }
  let locationArray = currentDirectory.split('/');
  let appIndex = locationArray.indexOf('app');
  for(var i=0;i<appIndex;i++){
    let pathComp = locationArray[i];
    lazyPath = lazyPath + pathComp + '/';
  }
  lazyPath = lazyPath + 'package.json';
  return lazyPath;
}

let browser_tree = [];

async function browse_dir(){

  // console.clear();

  const base_dir = await get_base_dir();
  if(!base_dir){
    return common.error("failed-get_base_dir-browse_dir");
  }

  let app_dir = base_dir + "app";
  for(let item of browser_tree){
    app_dir += '/' + item;
  }

  const dirs = await get_sub_dir(app_dir)
  .then((f)=>{return f;}).catch(()=>{return false;});

  if(!dirs){
    return common.error("failed-get_sub_dir-browse_dir");
  }

  let options = [];
  options.push("<<< back");
  options.push(">>> select this dir");
  for(let h of dirs){options.push(h);}

  const select = await input.select("please select a dir",options);
  if(select === "<<< back"){
    if(browser_tree.length > 0){
      browser_tree.pop();
    }
  } else
  if(select === ">>> select this dir"){
    return app_dir;
  } else {
    browser_tree.push(select);
  }

  return await browse_dir();

}

async function get_dir_items(path){
  return new Promise((resolve,reject)=>{
    fs.readdir(path,(e,items)=>{
      if(e){
        reject("failed-readdir-not_found");
      } else {
        resolve(items);
      }
    });
  });
}

async function get_sub_dir(path){
  return new Promise((resolve,reject)=>{
    fs.readdir(path,{withFileTypes:true},(e,items)=>{
      if(e){
        reject("failed-readdir-not_found");
      } else {
        let collect = [];
        for(let item of items){
          if(item.isDirectory()){
            collect.push(item.name);
          }
        }
        resolve(collect);
      }
    });
  });
}

async function get_base_dir(){
  let cwd = io.dir.cwd();
  if(cwd.includes("\\")){while(cwd.includes("\\")){cwd = cwd.replace('\\','/');}}
  let hold = cwd.split("/");
  let app_found = false;
  for(let h of hold){if(h === "app"){app_found = true;}}
  if(!app_found){if(await io.exists(cwd + "/app")){return cwd + "/";}}
  let remake = '';
  for(let h of hold){if(h === "app"){break;} else {
    remake += h + "/";
  }}
  return remake;
}
