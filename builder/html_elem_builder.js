
module.exports = {
    init:init,
    unfold_tree:unfold_tree,
    tree_branch:tree_branch,
    compile_elements:compile_elements,
    build_element_string:build_element_string,
    fold_element_with_children:fold_element_with_children,
    wrap:wrap
};

function init(elements,start_element){
    let childrens = compile_elements(elements);
    if(childrens === false){return false;}
    const tree = tree_branch(start_element,childrens,elements);
    if(tree === false){return false;}
    return unfold_tree(tree,0);
}

function tree_branch(id,childrens,elements){
    let children = [];
    if(childrens[id] instanceof Array){
        for(let child of childrens[id]){
            children.push(tree_branch(child.id,childrens,elements));
        }
    }
    let elem;
    if(
        id === "head" || 
        id === "body" ||
        id === "html"
    ){elem = {tag:`${id}`};} else {
        if(!elements[id]){return false;}
        elem = elements[id];
    }
    return {
        element:elem,
        children:children
    };
}

function compile_elements(elements){
    let childrens = {};
    for(let key in elements){
        let element = elements[key];
        if(!childrens.hasOwnProperty(element.parent)){
            childrens[element.parent] = [];
        }
        childrens[element.parent].push(element);
    }
    return childrens;
}

function unfold_tree(branch,index){
    let element = build_element_string(branch.element,false);
    if(element === false){return false;}
    let children = '';
    if(element.inner){
        children += `${tab_len(index+1)}${element.inner}`;
    }
    for(let child of branch.children){
        let chb = unfold_tree(child,index+1);
        if(!chb){return false;}
        children += children.length > 0 ? `\n${chb}` : `${chb}`;
    }
    return fold_element_with_children(element,children,index);
}

function tab_len(index){
    let t = '';
    for(let i=0;i<index;i++){t += ` `;}
    return t;
}

function fold_element_with_children(element,children,index){
    let t_len = tab_len(index);
    let build = '';
    build += `${t_len}${element.start}`;
    if(children.length > 0){build += `\n${children}\n`;}
    if(element.end){build += `${t_len}${element.end}`;}
    return build;
}

function wrap(element,childrens,index){
    let build = build_element_string(element);
    let hold = '';
    for(let child of childrens){
        hold += hold.length === 0 ? 
        `${shift_string_space(child)}` : 
        `\n${shift_string_space(child)}`;
    }
    return fold_element_with_children(build,hold,index);
}

function shift_string_space(string){
    let hold = string.split("\n");
    let rebuild = '';
    for(let item of hold){
        rebuild += rebuild.length === 0 ? " " + `${item}` : "\n " + `${item}`;
    }
    return rebuild;
}

function build_element_string(element,log){

    if(log){
        console.log({e:element});
    }

    let properties = ``;
    if(element.id && 
        !(
            element.id === "body" ||
            element.id === "title" ||
            element.id === "html"
        )
    ){properties += ` id="${element.id}"`;}

    if(typeof(element.style) === "string"){
        if(element.style.length > 5){
            let style_hash = engine.md5(element.style);
            let class_name;
            if(!builder.custom_style_name[style_hash]){
                class_name = builder.get_name();
                builder.custom_style_name[style_hash] = class_name;
                builder.add.css(`.${class_name}{${element.style}}`);
            } else {
                class_name = builder.custom_style_name[style_hash];
            }
            if(typeof(element.class) !== "string"){
                element.class = '';
            }
            element.class += ` ${class_name}`;
        }
    }

    // console.log({
    //     t:element.style
    // });

    // if(element.events){
    //     // console.log(element.events);
    //     for(let event in element.events){
            
    //     }
    // }
    const uncovered = ["onclick"];
    for(let key in element){
        if(
            key !== "id" &&
            key !== "styles" &&
            key !== "parent" &&
            key !== "add" &&
            key !== "appendChild" &&
            key !== "tag" &&
            key !== "innerHTML" &&
            key !== "text" &&
            key !== "function" &&
            key !== "functionData" &&
            key !== "funcData" &&
            key !== "addEventListener" &&
            key !== "events" &&
            key !== "className" &&
            key !== "style" &&
            key !== "remove"
        ){
            properties += ` ${key}=${uncovered.indexOf(key) < 0 ? `"` : ''}${element[key]}${uncovered.indexOf(key) < 0 ? `"` : ''}`;
        }
    }

    // if(element.style){properties += ` style="${element.style}"`;}

    const non_ending = ["br","input"];

    let start;
    if(element.id === "html"){
        start = '<!DOCTYPE html>\n<html>';
    } else {
        if(properties.length > 0){
            start = `<${element.tag}${properties}>`;
        } else {
            start = `<${element.tag}>`;
        }
    }
    let final = {start:start};
    if(element.innerHTML){final.inner = element.innerHTML;}
    if(non_ending.indexOf(element.tag) < 0){final.end = `</${element.tag}>`;}

    // if(element.tag === "input"){
    //     console.log({
    //         e:element,
    //         i:non_ending.indexOf(element.tag),
    //         f:final
    //     });
    // }

    return final;

}

