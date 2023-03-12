

let book = {
  fonts:{},
  colors:{}
};

module.exports = {

 colors:{
   add:(name,val)=>{
     book.colors[name] = val;
   },
   get:(name)=>{
     return book.colors[name];
   }
 },

 fonts:{
   add:async (tag,name,location,style,global_url)=>{
     return new Promise((resolve,reject)=>{
       let options = '';
       if(tag){options += "'" + tag + "',"} else {options += "null,"}
       if(name){options += "'" + name + "',"} else {options += "null,"}
       if(location){options += "'" + location + "',"} else {options += "null,"}
       if(style){options += "'" + style + "',"} else {options += "null,"}
       if(global_url){options += "'" + tag + "',"} else {options += "null"}
       let run_this_function = `engine.sketch.fonts.add(${options});`;
       builder.add_function(run_this_function);
       builder.add_api("engine.sketch.fonts.add");
       resolve();
     });
   },
   get:(tag)=>{
     return book.fonts[tag];
   }
 }

};
