var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var expenseSchema=new Schema({
    year:               Number,
    month:              String,
    salary:             Number,
    ika:                Number,
    water:              Number,
    energy:             Number,//ΔΕΗ
    cleaning:           Number,
    light:              Number,
    drains:             Number,//Αποχέτευση
    disinsectisation:   Number,//Απεντόμωση
    garden:             Number,
    liftUpKeep:         Number,//Συντήρηση ανελκυστήρα
    liftRepair:         Number,//Επισκευή ανελκυστήρα
    heat:               Number,//Θέρμανση πετρέλαιο/αέριο
    heatUpKeep:         Number,//Θέρμανση συντήρηση καυστήρα/λέβητα
    heatRepair:         Number,//Θέρμανση επισκευή καυστήρα/λέβητα
    reserve:            Number,//Αποθεματικό
    shared:             Number,//Έκδοση κοινοχρήστων
    otherExpenses:      Number,
    comments:           String,//για να μπει στο πινακα των αποτελεσμάτων
    block :      [{ type: Schema.Types.ObjectId, ref: 'Block' }]
})

//create the mongoose Model by calling mongoose.model.
var Expenses=mongoose.model('expense',expenseSchema);

module.exports=Expenses;