
module.exports = (tag,options)=>{

  let collect_options = {};
  for(var i in options){
    if(
      i !== 'function' &&
      i !== 'functionData' &&
      i !== 'events' &&
      i !== 'event' &&
      i !== 'text' &&
      i !== 'style' &&
      // i !== 'class' &&
      i !== 'parent' &&
      i !== 'tag' &&
      i !== 'list_id' &&
      i !== 'id' &&
      i !== 'draw'
    ){
      collect_options[i] = options[i];
    }
  }

  let element = {
    tag:tag,
    parent:options.parent,
    options:{},
    functions:[],
    apis:[]
  };

  if(options.text){element.text = options.text;}

  if(options.id){
    if(options.only_id){
      element.id = options.id;
    } else {
      element.id = element.parent + "-" + options.id;
    }
  } else {
    // element.id = element.parent + "-" + engine.uniqid();
    element.id = element.parent + "-" + builder.get_class_num();
  }
  collect_options.id = `${element.id}`;

  // let element_name = 'i_' + engine.md5(element.id);
  let element_name = 'i_' + builder.get_id_num();
  if(options.function){
    let default_event = 'click';
    let default_function = `"${element.id}",${JSON.stringify(options.functionData)},event`;
    if((tag == 'input' || tag == 'textarea') && options.type !== 'button'){
      default_event = 'input'
      if(options.type === "number"){
        default_function = `"${element.id}",Number(${element_name}.value),${JSON.stringify(options.functionData)},event`;
      } else if(options.type === "file"){
        default_function = `"${element.id}",${element_name}.files,${JSON.stringify(options.functionData)},event`;
      } else {
        default_function = `"${element.id}",${element_name}.value,${JSON.stringify(options.functionData)},event`;
      }
    }
    for(let api of builder.extract.apis(options.function.toString())){
      if(element.apis.indexOf(api) < 0){element.apis.push(api);}
    }
    element.functions.push(`
      let ${element_name} = document.getElementById("${element.id}");
      if(${element_name}){
        ${element_name}.addEventListener("${default_event}",(event)=>{
          let func = ${options.function.toString()};
          func(${default_function});
        });
      }
    `);
  }

  element.options = collect_options;

  builder.element.add(element);

  return element.id;

}
