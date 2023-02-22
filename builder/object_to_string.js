

module.exports = {
    parse_object:parse_object,
    parse_value:parse_value,
    parse_array:parse_array
};


function parse_object(data){
    let build = '';
    for(let key in data){
        build += build.length > 0 ? `,\n` : ``;
        build += `\n"${key}":${parse_value(data[key])}`;
    }
    return `{${build}\n}`;
}

function parse_array(data){
    let build = '';
    for(let value of data){
        build += build.length > 0 ? `, ` : ` `;
        build += `${parse_value(value)}`;
    }
    return `[${build}]`;
}

function parse_value(value){
    if(typeof(value) === "function"){
        return value.toString();
    } else if(value instanceof Array){
        return parse_array(value);
    } else if(typeof(value) === "object"){
        return parse_object(value);
    }  else if(typeof(value) === "string"){
        return `"${value}"`;
    } else {
        return `${value}`;
    }
}