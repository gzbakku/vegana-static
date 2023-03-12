

module.exports = {
  set:require("./set"),
  navigate:require('./nav'),
  back:require('./back'),
  init:require("./init"),
  route:[],
  closeures:[],
  active:{
    page:null,
    cont:null,
    panel:null
  },
  built:{
    page:[],
    cont:[],
    panel:[],
    tab:[],
    comp:[]
  },
  track:{
    cont:{},
    panel:{},
    tabs:{},
    comp:{}
  },
  mods:{
    page:{},
    cont:{},
    panel:{}
  }
};
