

module.exports = {

  list:(d)=>{
    if(!d.type){d.type = 'ol';}
    const list = engine.make.creator(d.type,d);
    for(let item of d.data){make_item(list,item,d.itemClass,d.function,d.events,d.event);}
    return list;
  },

  item:(d)=>{
    make_item(d.list_id,d,d.itemClass,d.function,d.events,d.event);
  },

  items:(d)=>{
    for(let item of d.data){
      make_item(d.list_id,item,d.itemClass,d.function,d.events,d.event);
    }
    return d.id;
  }

};

function make_item(listId,item,superClass,superFunction,superEvents,superEvent){
  let item_options = {};
  if(item.class){item_options.class = item.class;} else if(superClass){item_options.class = superClass;}
  if(item.function){item_options.function = item.function;} else if(superFunction){item_options.function = superFunction;}
  if(item.events){item_options.events = item.events;} else if(superEvents){item_options.events = superEvents;}
  if(item.event){item_options.event = item.event;} else if(superEvent){item_options.event = superEvent;}
  if(item.id){item_options.id = item.id;}
  item_options.text = item.text;
  item_options.parent = listId;
  return engine.make.creator('li',item_options);
}
