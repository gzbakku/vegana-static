

module.exports = {

  md5:require("md5"),
  uniqid:require("uniqid"),

  get:require("./get"),
  set:require("./set"),
  make:require("./make"),
  meta:require("./meta"),
  add:require("./add"),
  global:{object:{},function:{},comp:{}},
  router:require("./router"),
  sketch:require("./sketch"),
  static:require("./static"),
  common:require("./common"),

};
