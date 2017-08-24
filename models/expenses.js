var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var expenseSchema=new Schema({
    year:               Number,
    month:              String,
    salary:             Number,
    ika:                Number,
    water:              Number,//ΕΥΔΑΠ
    energy:             Number,//ΔΕΗ
    cleaning:           Number,//Καθαριμός
    light:              Number,//Φώτα αλλαγή
    drains:             Number,//Αποχέτευση
    disinsectisation:   Number,//Απεντόμωση
    garden:             Number,//Κήπος
    liftUpKeep:         Number,//Συντήρηση ανελκυστήρα
    liftRepair:         Number,//Επισκευή ανελκυστήρα - Εξοδο ιδιοκτήτη
    heat:               Number,//Θέρμανση πετρέλαιο/αέριο
    heatUpKeep:         Number,//Θέρμανση συντήρηση καυστήρα/λέβητα
    heatRepair:         Number,//Θέρμανση επισκευή καυστήρα/λέβητα - Εξοδο ιδιοκτήτη
    reserve:            Number,//Αποθεματικό - Εξοδο ιδιοκτήτη
    shared:             Number,//Έκδοση κοινοχρήστων
    otherExpenses:      Number,//Λοιπά έξοδα
    otherExpCom:        String,//Περιγραφη εξόδου για τα λοιπά
    comments:           String,//για να μπει στο πινακα των αποτελεσμάτων
    block :      [{ type: Schema.Types.ObjectId, ref: 'Block' }]
})

//create the mongoose Model by calling mongoose.model.
var Expenses=mongoose.model('expense',expenseSchema);

module.exports=Expenses;