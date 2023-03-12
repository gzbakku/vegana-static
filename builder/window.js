
module.exports = {
    set:set
};

function set(config){

    // console.log({
    //     c:config.location
    // });

    class FontFace{
        constructor(name,location){
            this.name = name;
            this.location = location;
        }
        load(){
            return new Promise((resolve,reject)=>{
                resolve(this);
            });
        }
    }

    class Image{
        constructor(){
            this.src = null;
        }
    }

    window.baseHref = "";
    window.FontFace = FontFace;
    window.Image = Image;
    window.config = config;

    window.pageModules = {};
    window.veganaLayoutColors = {};
    window.veganaLayoutFonts = {};
    window.veganaLayoutStyles = {};

    window.location = config.location;

    window.innerWidth = 0;
    window.innerHeight = 0;
    window.is_static = true;

    window.history = {
        replaceState:()=>{},
        pushState:()=>{},
    };

}

// global.window = {
//     pageModules:{},
//     veganaLayoutColors:{},
//     veganaLayoutFonts:{},
//     veganaLayoutStyles:{},
//     location:config.location,
//     innerWidth:0,
//     innerHeight:0,
//     is_static:true
// };
