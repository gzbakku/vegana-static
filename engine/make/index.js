
const list = require("./list");
const creator = require("./creator");

module.exports = {

  list:list.list,
  listItem:list.item,
  listItems:list.items,

  init:require("./init"),
  creator:creator,

  style:(d)=>{
    let element = builder.element.get(d.id);
    if(!element){return false;}
    element.style = d.style;
    return builder.element.update(d.id,element);
  },

  addClass:(d)=>{
    let element = builder.element.get(d.id);
    if(!element){return false;}
    if(element.options.class){
      if(element.options.class.indexOf(d.class) < 0){
        element.options.class += " " + d.class
      }
    }
    return builder.element.update(d.id,element);
  },

  removeClass:(d)=>{
    let element = builder.element.get(d.id);
    if(!element){return false;}
    if(element.options.class){
      element.options.class = element.options.class.replace(d.class,'');
    }
    return builder.element.update(d.id,element);
  },

  element:creator,
  span:(d)=>{return creator("span",d)},
  heading:(d)=>{if(!d.level){d.level = 1;}return creator('h' + d.level,d)},
  p:(d)=>{return creator("p",d)},
  text:(options)=>{
    let element = builder.element.get(options.id);
    if(element){
      element.text = options.text;
    }
  },

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

  button:(d)=>{d.type = 'button';return creator("input",d);},
  input:(d)=>{return creator("input",d);},
  select:(d)=>{return creator("select",d);},
  textarea:(d)=>{return creator("textarea",d);},
  enableButton:(id)=>{
    let element = builder.element.get(d.id);
    if(!element){return false;}
    element.options.disabled = false;
    return builder.element.update(id,element);
  }

};
