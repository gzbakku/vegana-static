function doo(id,what){
  let get = builder.element.get(id);
  if(!get){return false;}
  if(!get.style){get.style = {};}
  if(what == 'show'){
    get.style.display = 'block';
  } else if (what == 'hide'){
    get.style.display = 'none';
  } else if (what == 'remove'){
    return
    get.element.delete(id);
  }
  return builder.element.update(id,get);
}

module.exports= {

  hide : (id)=>{
    return doo(id,'hide');
  },
  show : (id)=>{
    return doo(id,'show');
  },
  remove : (id)=>{
    return doo(id,'remove');
  },

};
