const chalk = require('chalk');

module.exports = {

  error : function(error){
    console.log(chalk.red('!!! ' + error));
    if(exit_on_error){return process.exit(1);}
    return false;
  },

  tell : function(message){
    console.log(chalk.cyanBright('>>> ' + message));
    return true;
  },

  info : function(message){
    console.log(chalk.blue('??? ' + message));
    return true;
  },

  success : function(message){
    console.log(chalk.greenBright('@@@ ' + message));
    return true;
  },

  log:this.tell

};
