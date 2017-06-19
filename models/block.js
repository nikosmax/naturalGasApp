var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var blockSchema= new Schema({
    address:    String,
    location:   String,
    postal:     Number,
    nameRes:    String,
    phone:      Number,
    mobile:     Number,
    heatType:   String,
    user :      [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

//create the mongoose Model by calling mongoose.model.
var Block=mongoose.model('block',blockSchema);

module.exports=Block;
