var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var flatHeatCountSchema=new Schema({
    flatheatcount:  Number,
    debit:          Number,
    flat :          [{ type: Schema.Types.ObjectId, ref: 'Flat' }],
    expenses :      [{ type: Schema.Types.ObjectId, ref: 'Expenses' }]
})

//create the mongoose Model by calling mongoose.model.
var FlatHeatCount=mongoose.model('flatHeatCount',flatHeatCountSchema);

module.exports=FlatHeatCount;
