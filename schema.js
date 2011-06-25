var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var Product = new Schema({
  name : {type: String},
  description : {type: String},
  price : {type: Number},
  photo : {type: String}
});

var User = new Schema({
  login : {type: String, index:true},
  password : {type: String, index:true},
  role : {type: String}
});

User.static({
  authenticate : function(login,password,callback) {
    this.findOne({login:login,password:password},function(err,doc) {
      callback(doc);
    })
  }
});

mongoose.model('Product', Product);
mongoose.model('User', User);