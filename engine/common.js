module.exports= {

  kill : false,

  tell : function(message,control){
    if(control === true || this.kill === true){
      console.log('>>> ' + message);
    }
    return true;
  },

  error : function(error,data){
    if(exit_on_error){process.exit(1);}
    if(data){
      console.log(data);
    }
    console.error('!!! ' + error);
    return false;
  }

};
