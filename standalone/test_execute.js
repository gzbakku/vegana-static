

const vm = require("node:vm");

module.exports = {
    init:old_init
};

async function init(){
    return new Promise((resolve)=>{
        resolve("onlyfeet");
    });
}

// let ucc = 0;
if(global.fast_mem_flush){
    console.log(`>>> fast_mem_flush initiated => ${global.mem_flush_time||5000}`);
    setInterval(async ()=>{
        let m = await mem();
    },global.mem_flush_time||5000);
}

async function old_init(message){

    return new Promise(async (resolve,reject)=>{

        let context = new vm.createContext({
            window:{
                veganaStaticBuilderMessage:message,
                noVeganaDevReload:true
            },
            fetch:fetch,
            setTimeout:setTimeout,
            console:{log:console.log},
        });
        let script = new vm.Script(bundle);

        function success(){
            resolve(context.veganaStaticPublished);
        }

        function unset_timeout(e){
            clearTimeout(e);
        }
        function unset_interval(e){
            clearInterval(e);
        }

        let running = true;
        let interval = setInterval(async ()=>{
            if(typeof(context.veganaStaticPublished === "string")){
                running = false;
                unset_interval(interval);
                unset_timeout(out);
                success();
            }
        },5);

        let out = setTimeout(()=>{
            unset_interval(interval);
            if(running){running = false;reject("TIMEOUT");}
        },TIMEOUT);

        try{
            await script.runInNewContext(context,{
                timeout:TIMEOUT,
                microtaskMode: 'afterEvaluate'
            });
        } catch(e){
            console.log({ERR:e});
            unset_timeout(out);
            if(running){running = false;reject("TIMEOUT");}
        }

    });

}

function mem(){
    return new Promise((resolve)=>{
        vm.measureMemory({
            mode:'summary',
            execution:"eager"
        })
        .then((result) => {
            resolve(result.total.jsMemoryEstimate);
        })
        .catch((e)=>{});
    });
}

function mb(n){
    return `${n/1000000} mb`;
}


