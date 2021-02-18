const fs = require('fs-extra');
const get_npm_root = require("get_npm_root");

module.exports = {

  exists:async (location)=>{
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

  readJson:async (location)=>{
    let run = await fs.readFile(location,'utf-8')
    .then((data)=>{
      return data;
    })
    .catch((err)=>{
      common.error(err);
      return common.error("failed-readJson-io");
    });
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

  clean_path:clean_path

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
