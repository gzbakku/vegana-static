

module.exports = {
  add:(options)=>{return builder.meta.add(options);},
  update:(options)=>{return builder.meta.update(options);},
  delete:(name)=>{return builder.meta.delete(name);}
};
