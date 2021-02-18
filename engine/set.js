module.exports = {

  pageTitle : function(title){
    builder.add_title(title);
  },

  input : {

    value : function(id,value){
      let element = builder.element.get(id);
      element.value = value;
      builder.element.update(id,element);
      return true;
    }

  },

  style: function(id,styles){
    let element = builder.element.get(id);
    if(!element.styles){element.styles = {};}
    for(let style in styles){
      element.styles[style] = styles[style];
    }
    return true;
  },

  div : {

    text : function(id,value){
      let element = builder.element.get(id);
      element.text = value;
      builder.element.update(id,element);
      return true;
    },

    style: function(id,styles){
      let element = builder.element.get(id);
      if(!element.styles){element.styles = {};}
      for(let style in styles){
        element.styles[style] = styles[style];
      }
      return true;
    }

  }

}
