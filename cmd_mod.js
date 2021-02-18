const baseWorker = require('child_process');
const exec = baseWorker.exec;
const spawn = baseWorker.spawn;
const cross = require('cross-spawn');
const stream = require('stream');

async function log_message(builder){
  for await (const message of builder.stdout){
    console.log(message.toString('utf-8'));
  }
}

async function spawnChild(cmd,args){
  const builder = spawn(cmd,args,{stdio: [process.stdin, process.stdout, process.stderr]});
  let closing,closed;
  function close(){
    if(closed){return true;}
    if(closing){return null;} else {closing = true;}
    return new Promise((resolve,reject)=>{
      builder.kill('SIGINT');
      builder.on('exit',(e)=>{
        closed = true;
        resolve(true);
      });
    });
  }
  return {
    process:builder,
    close:close,
    closeStatus:()=>{
      return closed;
    }
  };
}

module.exports=  {

  child:spawnChild,

  run : function(cmd){

    return new Promise((resolve,reject)=>{

      if(cmd == null || cmd == undefined){
        reject('invalid_cmd');
      }

      const runner = exec(cmd,(err, stdout, stderr)=>{
        if(err){
          console.log(err);
          reject(err);
        }
        if(stderr){
          console.log(stderr);
          resolve(stderr);
        }
        if(stdout){
          console.log(stdout);
          resolve(stdout);
        }
      });

      // runner.stdout.on('data', (data)=>{console.log(data);});
      runner.stdout.pipe(process.stdout);

    });

  },

  runFile : function(cmd,argv){

    return new Promise((resolve,reject)=>{

      if(cmd == null || cmd == undefined){
        reject('invalid_cmd');
      }
      if(argv == null || cmd == argv){
        reject('invalid_argvs');
      }

      let child = cross.sync(cmd, argv, { stdio: 'inherit' });

      if(child.stderr !== null){
        reject(child);
      }

      if(child.error !== null){
        reject(child);
      }

      resolve(child);

    });

  }

};
