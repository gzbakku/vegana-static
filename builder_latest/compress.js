

module.exports = (string)=>{

    let rebuild = ``;
    let previous_was_empty = true;
    let boundry = false;

    for(let i=0;i<string.length;i++){
        let char = string[i];
        if(boundry){
            if(char === boundry && string[i-1] !== "\\"){
                boundry = false;
            }
        } else {
            if(char === `"` || char === `'` || char === "`"){
                boundry = char;
            }
        }
        if(!boundry){
            if((char === " " || char === "\n" || char === "\t")){
                if(!previous_was_empty){rebuild += " ";}
                previous_was_empty = true;
            } else {
                rebuild += char;
                previous_was_empty = false;
            }
        } else {
            rebuild += char;
            previous_was_empty = false;
        }
    }

    return rebuild;

}