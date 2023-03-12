

module.exports = {

  check : ()=>{return false;},
  start : ()=>{return false;},
  end : ()=>{return false;},

  token : false,
  uid   : false,
  user  : false,
  user_type  : false,
  session_type:false,

  get : {
    user:()=>{return false;},
    token:()=>{return false;},
    uid:()=>{return false;},
    session_type:()=>{return false;},
  }

};
