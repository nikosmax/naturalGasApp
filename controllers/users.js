var express=require('express');
var router=express.Router();
var User=require('../models/user');
var Block=require('../models/block');
var Flat=require('../models/flat');
var Expenses=require('../models/expenses');
var FlatHeatCount=require('../models/flatHeatCounts');

router.use(function requireLogin (req, res, next) {
    if (!req.user)
    {
        res.redirect('/login');
    }
    else
    {
        next();
    }
})

router.use(function flatsShowNav(req,res,next){
    Block.findOne({user:req.user._id},function(err,block) {
        if (block){
            Flat.find({block:block._id}, function (err, flats) {
                if (flats) {
                    req.flatsShow = flats;
                    res.locals.flatsShow = flats;
                    next();
                } else {
                    req.flatsShow = 'undefined';
                    res.locals.flatsShow = 'undefined';
                    next();
                }
            })
        }else next();
    })
})

//User profile page
router.get('/profile',function(req,res){
    var d=new Date(req.user.created_date);
    var mydate= d.getDate()+'-'+ (d.getMonth()+1)+'-'+ d.getFullYear();
    //console.log(req.flatsShow);
    res.render('profile',{
        name: req.user.name,
        username:req.user.username,
        date:mydate,
        flatsShownNav:req.flatsShow
    });
})

//Update profile
router.post('/updateProfile',function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err) console.log(err);
        user.name=req.body.name;
        user.username=req.body.username;

        user.save(function(err,update){
            if(err) throw err;
            console.log('update');
            res.redirect('profile');
        })
    })
})

//Block page
router.get('/block',function(req,res){
Block.findOne({'user': req.user._id},function(err,block) {
    if (err) console.log(err);
    if (block!= null) {
        res.render('block', {
        name: req.user.name,
        flatsShownNav:req.flatsShow,
        block:block,
        flag: 1
    });
    }else{
            res.render('block', {
            name: req.user.name,
            block:{},
            flatsShownNav:req.flatsShow,
            flag: 0
        });
    }
})
})

//block post first time contents
router.post('/block',function(req,res){
    req.checkBody('address','Address is required').notEmpty();
    req.checkBody('totalFlats','Total of flats is required').notEmpty();
    var errors=req.validationErrors();

    if(errors)
    {
        console.log('errors');
        res.render('block',{
            name: req.user.name,
            flatsShownNav:req.flatsShow,
            block:{},
            flag:0,
            errors:errors
        })
    }else {
        var newBlock= new Block({
            address:    req.body.address,
            location:   req.body.location,
            postal:     req.body.postal,
            nameRes:    req.body.nameRes,
            phone:      req.body.phone,
            mobile:     req.body.mobile,
            heatType:   req.body.heatType,
            heatFixed:  req.body.heatFixed,
            totalFlats: req.body.totalFlats,
            user :      req.user._id
        })

        newBlock.save(function(err){
            if (err) console.log(err);
            else console.log('Block saved successfully');
            res.render('block',{
                name:req.user.name,
                block:newBlock,
                flatsShownNav:req.flatsShow,
                flag:       1
            });
        })
    }
})

//block update contents
router.post('/blockUpdate',function(req,res){
    Block.findOne({user: req.user._id},function(err,block){
        if(err) console.log(err);
            block.address=req.body.address;
            block.location=req.body.location;
            block.postal=req.body.postal;
            block.nameRes=req.body.nameRes;
            block.phone=req.body.phone;
            block.mobile=req.body.mobile;
            block.heatType=req.body.heatType;
            block.heatFixed=req.body.heatFixed;
            block.totalFlats=req.body.totalFlats;

        block.save(function(err,update){
            if(err) console.log(err);
            console.log('block updated');
            res.redirect('block');
        })
    })
})

//Flat page
router.get('/flat',function(req,res){
    Flat.count({block:req.blockData._id},function(err,count){
        if (err) console.log(err);
        res.render('flat',{
            name: req.user.name,
            flatsCount:req.blockData.totalFlats,
            count:count,
            flatsShownNav:req.flatsShow,
            flat: 'undefined'
        });
    })
})

//Flat post first time contents
router.post('/flat',function(req,res){
    Block.findOne({user: req.user._id},function(err,block) {
            if (err) conslole.log(err);
            if(block) {
            var newFlat = new Flat({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                mobile: req.body.mobile,
                email: req.body.email,
                flatNum: req.body.flatNum,
                koinratio: req.body.koinratio,
                liftratio: req.body.liftratio,
                flatxil: req.body.flatxil,
                owner: req.body.owner,
                block: block._id
            })

            newFlat.save(function (err) {
                if (err) console.log(err);
                else console.log('Flat saved successfully');
                res.redirect('flat');
            })
        }else{
            console.log('Block not found');
            Flat.count({},function(err,count) {
                res.render('flat', {
                    name: req.user.name,
                    flatsCount:req.blockData.totalFlats,
                    count:count,
                    flatsShownNav:req.flatsShow,//show flats in left navigation menu
                    errors: 'Δεν υπάρχει καταχωρημένη πολυκατοικία'
                })
            })
        }
    })
})

//flat page contents and info
router.get('/flat/:flatId',function(req,res){
    Flat.findOne({_id: req.params.flatId},function(err,flat){
        if(err) console.log(err);
        res.render('flat',{
            name: req.user.name,
            flatsCount:req.blockData.totalFlats,
            flatsShownNav:req.flatsShow,//show flats in left navigation menu
            count:null,
            flat:flat
        })
    })
})

//flat page corrections
router.post('/flat/:flatId',function(req,res){
    Flat.findOne({_id: req.params.flatId},function(err,flat){
        if(err) console.log(err);
            flat.firstname= req.body.firstname;
            flat.lastname= req.body.lastname;
            flat.phone= req.body.phone;
            flat.mobile= req.body.mobile;
            flat.email= req.body.email;
            flat.flatNum= req.body.flatNum;
            flat.koinratio= req.body.koinratio;
            flat.liftratio= req.body.liftratio;
            flat.flatxil= req.body.flatxil;
            flat.owner= req.body.owner;

        flat.save(function (err) {
            if (err) console.log(err);
            else console.log('Flat updated successfully');
            res.render('flat',{
                name: req.user.name,
                flatsCount:req.blockData.totalFlats,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                count:null,
                flat:flat
            })
        })
    })
})

//Month expenses page
router.get('/monthexpenses',function(req,res){
    res.render('monthExpenses',{
        name: req.user.name,
        flatsShownNav:req.flatsShow,//show flats in left navigation menu
        errorMessage:false
    });
})

//Put Month expenses
router.post('/monthexpenses',function(req,res){
    Expenses.findOne({year:req.body.year,month:req.body.month},function(err,expenses){
        if(err) console.log(err);
        if(expenses){
            res.render('monthExpenses',{
                name: req.user.name,
                flatsShownNav: req.flatsShow,//show flats in left navigation menu,
                errorMessage:'Έχει γίνει υπολογισμός για την συγκεκριμένη επιλογή έτους και μήνα'
            })
        }else {
            var newExpenses = new Expenses({
                year: req.body.year,
                month: req.body.month,
                salary: req.body.salary,
                ika: req.body.ika,
                water: req.body.water,
                energy: req.body.energy,//ΔΕΗ
                cleaning: req.body.cleaning,
                light: req.body.light,
                drains: req.body.drains,//Αποχέτευση
                disinsectisation: req.body.disinsectisation,//Απεντόμωση
                garden: req.body.garden,
                liftUpKeep: req.body.liftUpKeep,
                liftRepair: req.body.liftRepair,
                heat: req.body.heat,//Θέρμανση
                reserve: req.body.reserve,//Αποθεματικό
                shared: req.body.shared,//Έκδοση κοινοχρήστων
                otherExpenses: req.body.otherExpenses,
                block: req.blockData._id
            })

            newExpenses.save().then(function () {
                console.log('New expense saved');
                Expenses.findOne({block: req.blockData._id, year: req.body.year, month: req.body.month}, function (err, expenses) {
                    if (err) console.log(err);
                    if (!expenses)
                        console.log('no expenses');
                    else {
                        var flatCountsArray = [];
                        for (var i = 0; i < req.body.flat.length; i++) {

                            var flatCounts = new FlatHeatCount({
                                flatheatcount: req.body.flatheatcount[i],
                                flat: req.body.flat[i],
                                expenses: expenses._id
                            })
                            //console.log(flatCounts);
                            /*
                             flatCounts.flatheatcount= req.body.flatheatcount[i];
                             flatCounts.flat= req.body.flat[i];
                             flatCounts.expenses= expenses._id;
                             flatCountsArray.push(flatCounts) ;
                             */
                            flatCounts.save(function (err) {
                                if (err) console.log(err);
                                else {
                                    console.log('Flat counts saved successfully');
                                }
                            })
                        }
                        res.redirect('monthExpenses');
                    }
                })
            }, function (err) {
                if (err) console.log(err);
            })
        }
    })
})

//Results page
router.get('/results',function(req,res){
    res.render('results',{
        name: req.user.name,
        flatsShownNav:req.flatsShow,//show flats in left navigation menu
        expenses:'',
        totalExpenses:''
    });
})

//Results post page find
router.post('/results',function(req,res){
    Expenses.findOne({year:req.body.year,month:req.body.month},function(err,expenses){
        if(err) console.log(err);
        if(expenses){
            var greekExpenses = {
             Έτος:'',
             Μήνας:'',
             'Βοηθός Διαχειριστή':'',
             'Εργοδοτική Εισ':'',
             ΕΥΔΑΠ:'',
             ΔΕΗ:'',
             Καθαριότητα:'',
             Λαμπτήρες:'',
             Αποχέτευση:'',
             Απεντόμωση:'',
            'Συντήρηση Κήπου':'',
            'Ασανσέρ Συντήρηση':'',
            'Ασανσέρ Ανταλ. Επισκευή':'',
            'Πετρέλαιο/Αέριο':'',
            Αποθεματικό:'',
            'Αμοιβή εκδ. Κοινοχρήστωνv':'',
            'Λοιπά έξοδα':''
            };
                greekExpenses['Έτος']=expenses.year;
                greekExpenses['Μήνας']=expenses.month;
                greekExpenses['Βοηθός Διαχειριστή']=expenses.salary;
                greekExpenses['Εργοδοτική Εισ']=expenses.ika;
                greekExpenses['ΕΥΔΑΠ']=expenses.water;
                greekExpenses['ΔΕΗ']=expenses.energy;
                greekExpenses['Καθαριότητα']=expenses.cleaning;
                greekExpenses['Λαμπτήρες']=expenses.light;
                greekExpenses['Αποχέτευση']=expenses.drains;
                greekExpenses['Απεντόμωση']=expenses.disinsectisation;
                greekExpenses['Συντήρηση Κήπου']=expenses.garden;
                greekExpenses['Ασανσέρ Συντήρηση']=expenses.liftUpKeep;
                greekExpenses['Ασανσέρ Ανταλ. Επισκευή']=expenses.liftRepair;
                greekExpenses['Πετρέλαιο/Αέριο']=expenses.heat;
                greekExpenses['Αποθεματικό']=expenses.reserve;
                greekExpenses['Αμοιβή εκδ. Κοινοχρήστωνv']=expenses.shared;
                greekExpenses['Λοιπά έξοδα']=expenses.otherExpenses;

            var objTotal=expenses.toObject();
            delete objTotal._id;
            delete objTotal.year;
            delete objTotal.month;
            delete objTotal.block;

           //total sum of the month expenses
            var totalExpenses=0;
            for(var key in objTotal){
                totalExpenses+=objTotal[key];
            }
    FlatHeatCount.find({expenses:expenses._id}, null, {sort: {_id: 1}}, function(err,flatHeatCount){
        if(err) console.log(err);
            res.render('results',{
                name: req.user.name,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                expenses:greekExpenses,
                flatHeatCount:flatHeatCount,
                totalExpenses:totalExpenses
            })
          })
        }
    })
})

module.exports = router;


