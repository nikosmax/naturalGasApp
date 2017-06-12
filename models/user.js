var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var userSchema=new Schema({
    name: String,
    username:{type:String,required: true,unique:true},
    password:{type:String,required:true},
    created_date:{type:Date,default:Date.now}
});

//create the mongoose Model by calling mongoose.model.
var User=mongoose.model('User',userSchema);

module.exports=User;