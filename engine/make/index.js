

const creator = require("./creator");

module.exports = {
  init:require("./init"),
  creator:creator,

  div:(d)=>{return creator("div",d)},
  image:(options)=>{
    if(options.type == 'local'){
      if(options.location[0] !== '/'){
        if(!window.hasOwnProperty('is_electron') && !window.hasOwnProperty('is_cordova')){
          options.location = '/' + options.location;
        }
      }
      options.src = builder.base_href + options.location;
    } else {options.src = options.location;}
    delete options.location;
    delete options.type;
    return creator("img",options);
  },

  input:(d)=>{return creator("input",d);},
  textarea:(d)=>{return creator("textarea",d);}

};
