

module.exports = {
  onWeb:(d,f)=>{
    if(!d){d = {};}
    let f_string = f.toString();
    builder.add_apis(builder.extract.apis(f_string));
    let func_name = 'i_' + builder.get_var_num();
    builder.add_function(`
      let ${func_name} = ${f_string};
      ${func_name}(${JSON.stringify(d)});
    `);
  },
  publish:()=>{
    return builder.publish();
  }
};
