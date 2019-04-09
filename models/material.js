var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var materialSchema= new Schema({
    supplier:    {type:String, required: true},
    location:   String,
    email:      String,
    phone:      Number,
    mobile:     Number,
    materialType:   String,
    materialDescription:  String,
    retailPrice: {type:Number,required: true},
    discount:    Number
})

//create the mongoose Model by calling mongoose.model.
var Material=mongoose.model('material',materialSchema);

module.exports=Material;
