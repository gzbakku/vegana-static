

const vm = require("node:vm");

async function init(message){

    return new Promise(async (resolve,reject)=>{

        let start = time();

        const script = new vm.Script(bundle);

        // console.log(`time => script : ${time()-start} ms`);

        let context = new vm.createContext({
            cola:true,
            window:{
                veganaStaticBuilderMessage:message,
                noVeganaDevReload:true
            },
            fetch:fetch,
            setTimeout:setTimeout,
            console:{log:console.log},
        });

        // console.log(`time => script : ${time()-start} ms`);

        let running = true;
        let interval = setInterval(async ()=>{
            if(typeof(context.veganaStaticPublished === "string")){
                running = false;
                clearInterval(interval);
                clearTimeout(out);
                resolve(context.veganaStaticPublished);
            }
        },5);

        let out = setTimeout(()=>{
            clearInterval(interval);
            if(running){running = false;reject("TIMEOUT");}
        },TIMEOUT);

        try{
            let e = await script.runInNewContext(context,{
                timeout:TIMEOUT,
                microtaskMode: 'afterEvaluate'
            });
        } catch(e){
            console.log({ERR:e});
            clearTimeout(out);
            if(running){running = false;reject("TIMEOUT");}
        }

    });

    
    


}

module.exports = {
    init:init
};
