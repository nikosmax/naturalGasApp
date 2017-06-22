var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var flatSchema= new Schema({
    firstname:    String,
    lastname:     String,
    phone:        Number,
    mobile:       Number,
    email:        String,
    flatNum:      String,
    koinratio:    Number,
    liftratio:    Number,
    flatxil:      Number,
    owner:        String,
    block :      [{ type: Schema.Types.ObjectId, ref: 'Block' }]
})

//create the mongoose Model by calling mongoose.model.
var Flat=mongoose.model('flat',flatSchema);

module.exports=Flat;

