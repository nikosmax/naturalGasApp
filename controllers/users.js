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

//Εμφάνιση της λίστας διαμερισματων στην αριστερή navigation bar
router.use(function flatsShowNav(req,res,next){
    Block.findOne({user:req.user._id},function(err,block) {
        if (block){
            Flat.find({block:block._id},null, {sort: {_id: 1}}, function (err, flats) {
                if (flats) {
                    req.flatsShow = flats;
                    res.locals.flatsShow = flats;
                    //console.log(flats);
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

//Δημιουργία του Calendar  σε όλες τις σελίδες
router.use(function flatsShowCalendar(req,res,next){
    Expenses.find({block:req.blockData._id},function(err,expenses) {
        if(err) console.log(err);
        //console.log(expenses);
        if (expenses){
            req.calendarShow = expenses;
            res.locals.calendarShow = expenses;
            next();
        } else{
            req.calendarShow = 'undefined';
            res.locals.calendarShow = 'undefined';
            next();
        }
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
        flatsShownNav:req.flatsShow,
        calendar:req.calendarShow
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
        calendar:req.calendarShow,
        block:block,
        flag: 1
    });
    }else{
            res.render('block', {
            name: req.user.name,
            block:{},
            flatsShownNav:req.flatsShow,
            calendar:req.calendarShow,
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
            calendar:req.calendarShow,
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
            reserve:    req.body.reserve,
            user :      req.user._id
        })

        newBlock.save(function(err){
            if (err) console.log(err);
            else console.log('Block saved successfully');
            res.render('block',{
                name:req.user.name,
                block:newBlock,
                flatsShownNav:req.flatsShow,
                calendar:req.calendarShow,
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
            block.reserve=req.body.reserve;

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
            typeOfHeat:req.blockData.heatType,
            count:count,
            flatsShownNav:req.flatsShow,
            calendar:req.calendarShow,
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
                ei:req.body.ei,
                fi:req.body.fi,
                owner: req.body.owner,
                balance:req.body.balance,
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
                    typeOfHeat:req.blockData.heatType,
                    count:count,
                    flatsShownNav:req.flatsShow,//show flats in left navigation menu
                    calendar:req.calendarShow,
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
            flatsCount:req.blockData.totalFlats,//from session cookie blockData
            typeOfHeat:req.blockData.heatType,
            flatsShownNav:req.flatsShow,//show flats in left navigation menu
            calendar:req.calendarShow,
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
            flat.balance=req.body.balance;


        flat.save(function (err) {
            if (err) console.log(err);
            else console.log('Flat updated successfully');
            res.render('flat',{
                name: req.user.name,
                flatsCount:req.blockData.totalFlats,
                typeOfHeat:req.blockData.heatType,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                calendar:req.calendarShow,
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
        calendar:req.calendarShow,
        typeOfHeat:req.blockData.heatType,
        blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
        errorMessage:false,
        expenses: 'undefined',
        flatHeatCount:'undefined',//μονάδες θέρμανσης
        id:''
    });
})

//Put Month expenses
router.post('/monthexpenses',function(req,res){
    Expenses.findOne({year:req.body.year,month:req.body.month,block: req.blockData._id},function(err,expenses){
        if(err) console.log(err);
        if(expenses){
            res.render('monthExpenses',{
                name: req.user.name,
                flatsShownNav: req.flatsShow,//show flats in left navigation menu,
                calendar:req.calendarShow,
                typeOfHeat:req.blockData.heatType,
                blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
                errorMessage:'Έχει γίνει υπολογισμός για την συγκεκριμένη επιλογή έτους και μήνα',
                expenses: 'undefined',
                flatHeatCount:'undefined',//μονάδες θέρμανσης
                id:''
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
                heatUpKeep: req.body.heatUpKeep,//Θέρμανση
                heatRepair: req.body.heatRepair,//Θέρμανση
                reserve: req.body.reserve,//Αποθεματικό
                shared: req.body.shared,//Έκδοση κοινοχρήστων
                otherExpenses: req.body.otherExpenses,
                otherExpCom:req.body.otherExpCom,
                comments:req.body.comments,
                block: req.blockData._id
            })

            newExpenses.save().then(function () {
                console.log('New expense saved');
                Expenses.findOne({block: req.blockData._id, year: req.body.year, month: req.body.month}, function (err, expenses) {
                    if (err) console.log(err);
                    if (!expenses){
                        console.log('no expenses');
                    }else{
                        var i=-1;

                        var loop=function() {
                            i++;
                            if (i === req.body.flat.length){
                                done();
                                return;
                            }
                            var flatCounts = new FlatHeatCount({
                                flatheatcount: req.body.flatheatcount[i],
                                debit:req.body.debit[i],
                                flat: req.body.flat[i],
                                expenses: expenses._id
                            })
                                return flatCounts.save(function(err){
                                    if(err) console.log(err);
                                    //console.log('new count added..');
                                    loop();
                                })
                        }

                        loop();

                        function done() {
                            console.log('All data with debits has been loaded :).');
                        }

                        res.redirect('monthExpenses');
                    }
                })
            }).then(function(){
                var debit=req.body.debit;
                var i=-1;

                var loop=function() {
                    i++;
                    if (i === req.body.flat.length){
                        done();
                        return;
                    }
                   Flat.findOne({block: req.blockData._id,_id: req.body.flat[i]}).exec().then(function(flat) {
                        if (err) console.log(err);
                        //console.log(debit[i] + ' ' + flat.flatNum );
                        flat.balance+=Number(debit[i]);

                        return flat.save(function(err){
                            if(err) console.log(err);
                            //console.log('new debit added..');
                            loop();
                        })
                    })
                };

                loop();

                function done() {
                    console.log('All data with new balance has been loaded :).');
                }

            }, function (err) {
                if (err) console.log(err);
            })
        }
    })
})

//Get month expenses for correction
router.get('/monthexpenses/:monthexpensesId',function(req,res){
    Expenses.findOne({_id: req.params.monthexpensesId},function(err,expenses){
        if(err) console.log(err);
        var filterExpenses = {
            year:'',
            month:'',
            salary:'',
            ika:'',
            water:'',
            energy:'',
            cleaning:'',
            light:'',
            drains:'',
            disinsectisation:'',
            garden:'',
            liftUpKeep:'',
            liftRepair:'',
            heat:'',
            heatUpKeep:'',
            heatRepair:'',
            reserve:'',
            shared:'',
            otherExpenses:'',
            otherExpCom:'',
            comments:''
        };
        filterExpenses['year']=expenses.year;
        filterExpenses['month']=expenses.month;
        filterExpenses['salary']=expenses.salary;
        filterExpenses['ika']=expenses.ika;
        filterExpenses['water']=expenses.water;
        filterExpenses['energy']=expenses.energy;
        filterExpenses['cleaning']=expenses.cleaning;
        filterExpenses['light']=expenses.light;
        filterExpenses['drains']=expenses.drains;
        filterExpenses['disinsectisation']=expenses.disinsectisation;
        filterExpenses['garden']=expenses.garden;
        filterExpenses['liftUpKeep']=expenses.liftUpKeep;
        filterExpenses['liftRepair']=expenses.liftRepair;
        filterExpenses['heat']=expenses.heat;
        filterExpenses['heatUpKeep']=expenses.heatUpKeep;
        filterExpenses['heatRepair']=expenses.heatRepair;
        filterExpenses['reserve']=expenses.reserve;
        filterExpenses['shared']=expenses.shared;
        filterExpenses['otherExpenses']=expenses.otherExpenses;
        filterExpenses['otherExpCom']=expenses.otherExpCom;
        filterExpenses['comments']=expenses.comments;

    FlatHeatCount.find({expenses:expenses._id}, null, {sort: {_id: 1}}, function(err,flatHeatCount) {
        if (err) console.log(err);
        res.render('monthExpenses', {
            name: req.user.name,//show user name in left navigation menu
            flatsShownNav: req.flatsShow,//show flats in left navigation menu
            calendar: req.calendarShow,//show calendar in left navigation menu
            typeOfHeat:req.blockData.heatType,
            blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
            expenses: filterExpenses,
            id: expenses._id,
            flatHeatCount:flatHeatCount,//μονάδες θέρμανσης
            errorMessage: false
        })
      })
    })
})

//Post expenses data for correction
router.post('/monthexpenses/:monthexpensesId',function(req,res){
    Expenses.findOne({_id: req.params.monthexpensesId},function(err,expenses) {
        if(err) console.log(err);

            expenses.year= req.body.year;
            expenses.month= req.body.month;
            expenses.salary= req.body.salary;
            expenses.ika=req.body.ika;
            expenses.water= req.body.water;
            expenses.energy= req.body.energy;//ΔΕΗ
            expenses.cleaning= req.body.cleaning;
            expenses.light= req.body.light;
            expenses.drains= req.body.drains;//Αποχέτευση
            expenses.disinsectisation= req.body.disinsectisation;//Απεντόμωση
            expenses.garden= req.body.garden;
            expenses.liftUpKeep= req.body.liftUpKeep;
            expenses.liftRepair= req.body.liftRepair;
            expenses.heat= req.body.heat;//Θέρμανση
            expenses.heatUpKeep= req.body.heatUpKeep;//Θέρμανση
            expenses.heatRepair= req.body.heatRepair;//Θέρμανση
            expenses.reserve= req.body.reserve;//Αποθεματικό
            expenses.shared= req.body.shared;//Έκδοση κοινοχρήστων
            expenses.otherExpenses= req.body.otherExpenses;
            expenses.otherExpCom= req.body.otherExpCom;
            expenses.comments= req.body.comments;

        expenses.save(function(err){
            if(err) console.log(err);
            console.log('expenses saved');
            var heatingUnits=req.body.flatheatcount;
            var flatDebit=req.body.debit; //Ποσό χρέωσης διαμερίσματος
            var count=0;
            var i=-1;

            var loop=function() {
                i++;
                if (i === req.body.flat.length){
                    done();
                    return;
                }
                     FlatHeatCount.findOne({expenses: req.params.monthexpensesId, flat: req.body.flat[i]}).exec().then(function(flatheatcount) {
                          if (err) console.log(err);
                          console.log(heatingUnits[i] + ' ' + flatheatcount.flat +' '+ flatDebit[i] );
                         flatheatcount.flatheatcount=heatingUnits[i];
                         flatheatcount.debit=flatDebit[i];

                         return flatheatcount.save(function(err){
                             if(err) console.log(err);
                             console.log('count saved..');
                             loop();
                         })
                      })
            };

            loop();

            function done() {
                console.log('All data has been loaded :).');
            }

            res.render('monthExpenses',{
                name: req.user.name,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                calendar:req.calendarShow,//Calendar in left navigation menu to see if we have set expenses for a month
                typeOfHeat:req.blockData.heatType,//Type of heat
                blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
                errorMessage:false,
                expenses: 'undefined',
                flatHeatCount:'undefined',//μονάδες θέρμανσης
                id:''
            });
        })
    })
})

router.get('/delete/:deleteId',function(req,res) {
    Expenses.remove({_id: req.params.deleteId}).exec();
    FlatHeatCount.find({expenses: req.params.deleteId},function(err,flatheatcount){
        var i=-1;

        var loop=function() {
            i++;
            if (i === flatheatcount.length){
                done();
                return;
            }
            Flat.findOne({block: req.blockData._id,_id: flatheatcount[i].flat}).exec().then(function(flat) {
                if (err) console.log(err);
                flat.balance-=Number(flatheatcount[i].debit);

                return flat.save(function(err){
                    if(err) console.log(err);
                    //console.log('new debit added..');
                    loop();
                })
            })
        };

        loop();

        function done() {
            console.log('All data with new balance has been loaded :).');
        }


    }).then(function(){
        FlatHeatCount.remove({expenses: req.params.deleteId}).exec();
    })


    res.redirect('/users/monthExpenses');
    console.log('deleted');
})

//Results page
router.get('/results',function(req,res){
    res.render('results',{
        name: req.user.name,
        flatsShownNav:req.flatsShow,//show flats in left navigation menu
        calendar:req.calendarShow,
        typeOfHeat:req.blockData.heatType,
        expenses:'',
        totalExpenses:'',
        results:''
    });
})

//Results post page find
router.post('/results',function(req,res){
    Expenses.findOne({year:req.body.year,month:req.body.month,block: req.blockData._id},function(err,expenses){
        if(err) console.log(err);
        if(expenses){
            var greekExpenses = {//object for display form labels in greeks
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
            'Συντήρηση Καυστήρα/Λέβητα':'',
            'Επισκευή Καυστήρα/Λέβητα':'',
            Αποθεματικό:'',
            'Αμοιβή εκδ. Κοινοχρήστωνv':'',
            'Λοιπά έξοδα':'',
            'Περιγραφή εξόδου':''
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
                greekExpenses['Συντήρηση Καυστήρα/Λέβητα']=expenses.heatUpKeep;
                greekExpenses['Επισκευή Καυστήρα/Λέβητα']=expenses.heatRepair;
                greekExpenses['Αποθεματικό']=expenses.reserve;
                greekExpenses['Αμοιβή εκδ. Κοινοχρήστωνv']=expenses.shared;
                greekExpenses['Λοιπά έξοδα']=expenses.otherExpenses;
                greekExpenses['Περιγραφή εξόδου']=expenses.otherExpCom;

            var objTotal=expenses.toObject();
            delete objTotal._id;
            delete objTotal.year;
            delete objTotal.month;
            delete objTotal.block;
            delete objTotal.otherExpCom;
            delete objTotal.comments;

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
                calendar:req.calendarShow,// calendar with months
                typeOfHeat:req.blockData.heatType,
                expenses:greekExpenses,//Τα έξοδα με ελληνικούς τίτλους
                flatHeatCount:flatHeatCount,//μονάδες θέρμανσης
                blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
                totalExpenses:totalExpenses,//Το σύνολο όλων των εξόδων
                comments:expenses.comments,
                results:''
            })
          })
        }else{
            res.render('results',{
                name: req.user.name,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                calendar:req.calendarShow,
                typeOfHeat:req.blockData.heatType,
                expenses:'',
                totalExpenses:'',
                comments:'',
                results:'Δεν βρέθηκε Καταχώρηση για την επιλογή μήνα: '+ req.body.month
            })
        }
    })
})

//Results page per flat
router.get('/resultsPerFlat',function(req,res){
    res.render('resultsPerFlat',{
        name: req.user.name,
        flatsShownNav:req.flatsShow,//show flats in left navigation menu
        calendar:req.calendarShow,
        typeOfHeat:req.blockData.heatType,
        nameRes:req.blockData.nameRes,//Όνομα διαχειριστή
        expenses:'',
        totalExpenses:'',
        results:''
    });
})

//Results post page per flat find
router.post('/resultsPerFlat',function(req,res){
    Expenses.findOne({year:req.body.year,month:req.body.month,block: req.blockData._id},function(err,expenses){
        if(err) console.log(err);
        if(expenses){
            var greekExpenses = {//object for display form labels in greeks
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
                'Συντήρηση Καυστήρα/Λέβητα':'',
                'Επισκευή Καυστήρα/Λέβητα':'',
                Αποθεματικό:'',
                'Αμοιβή εκδ. Κοινοχρήστωνv':'',
                'Λοιπά έξοδα':'',
                'Περιγραφή εξόδου':''
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
            greekExpenses['Συντήρηση Καυστήρα/Λέβητα']=expenses.heatUpKeep;
            greekExpenses['Επισκευή Καυστήρα/Λέβητα']=expenses.heatRepair;
            greekExpenses['Αποθεματικό']=expenses.reserve;
            greekExpenses['Αμοιβή εκδ. Κοινοχρήστωνv']=expenses.shared;
            greekExpenses['Λοιπά έξοδα']=expenses.otherExpenses;
            greekExpenses['Περιγραφή εξόδου']=expenses.otherExpCom;

            var objTotal=expenses.toObject();
            delete objTotal._id;
            delete objTotal.year;
            delete objTotal.month;
            delete objTotal.block;
            delete objTotal.otherExpCom;
            delete objTotal.comments;

            //total sum of the month expenses
            var totalExpenses=0;
            for(var key in objTotal){
                totalExpenses+=objTotal[key];
            }
            FlatHeatCount.find({expenses:expenses._id}, null, {sort: {_id: 1}}, function(err,flatHeatCount){
                if(err) console.log(err);
                res.render('resultsPerFlat',{
                    name: req.user.name,
                    flatsShownNav:req.flatsShow,//show flats in left navigation menu
                    calendar:req.calendarShow,// calendar with months
                    typeOfHeat:req.blockData.heatType,
                    nameRes:req.blockData.nameRes,//Όνομα διαχειριστή
                    expenses:greekExpenses,//Τα έξοδα με ελληνικούς τίτλους
                    flatHeatCount:flatHeatCount,//μονάδες θέρμανσης
                    blockHeatFixed:req.blockData.heatFixed,//Πάγιο θέρμανσης από cookies
                    totalExpenses:totalExpenses,//Το σύνολο όλων των εξόδων
                    comments:expenses.comments,
                    results:''
                })
            })
        }else{
            res.render('resultsPerFlat',{
                name: req.user.name,
                flatsShownNav:req.flatsShow,//show flats in left navigation menu
                calendar:req.calendarShow,
                typeOfHeat:req.blockData.heatType,
                nameRes:req.blockData.nameRes,//Όνομα διαχειριστή
                expenses:'',
                totalExpenses:'',
                comments:'',
                results:'Δεν βρέθηκε Καταχώρηση για την επιλογή μήνα: '+ req.body.month
            })
        }
    })
})

//Payment control page
router.get('/paymentControl',function(req,res){
    res.render('paymentControl',{
        name: req.user.name,
        flatsShownNav:req.flatsShow,//show flats in left navigation menu
        calendar:req.calendarShow,
        typeOfHeat:req.blockData.heatType,
        expenses:'',
        results:''
    });
})

router.post('/paymentControl',function(req,res){
    if(!req.body.balance) {
        Expenses.findOne({
            year: req.body.year,
            month: req.body.month,
            block: req.blockData._id
        }, function (err, expenses) {
            if (err) console.log(err);
            if (expenses) {
                FlatHeatCount.find({expenses: expenses._id}, null, {sort: {_id: 1}}, function (err, flatHeatCount) {
                    if (err) console.log(err);
                    res.render('paymentControl', {
                        name: req.user.name,
                        flatsShownNav: req.flatsShow,//show flats in left navigation menu
                        calendar: req.calendarShow,// calendar with months
                        typeOfHeat: req.blockData.heatType,
                        expenses: expenses,
                        flatHeatCount: flatHeatCount,//μονάδες θέρμανσης
                        results: ''
                    })
                })
            } else {
                res.render('paymentControl', {
                    name: req.user.name,
                    flatsShownNav: req.flatsShow,//show flats in left navigation menu
                    calendar: req.calendarShow,
                    typeOfHeat: req.blockData.heatType,
                    expenses: '',
                    results: 'Δεν βρέθηκε Καταχώρηση για την επιλογή μήνα: ' + req.body.month
                })
            }
        })
    }else{
        Expenses.findOne({year: req.body.year, month: req.body.month, block: req.blockData._id}, function (err, expenses) {
            if (err) console.log(err);
            if (expenses) {
                var payoff=req.body.payoff; //Ποσό χρέωσης διαμερίσματος
                console.log(payoff);
                var count=0;
                var i=-1;

                    var loop=function() {
                        i++;
                        if (i === req.body.flat.length){
                            done();
                            return;
                        }
                        FlatHeatCount.findOne({expenses: expenses._id, flat: req.body.flat[i]}).exec().then(function(flatheatcount) {
                            if (err) console.log(err);
                            console.log(flatheatcount.flat +' '+ payoff[i] );
                            flatheatcount.payoff=payoff[i];

                            return flatheatcount.save(function(err){
                                if(err) console.log(err);
                                console.log('Data payoff saved..');
                                loop();
                            })
                        })
                    };

                    loop();

                    function done() {
                        console.log('All data has been loaded :).');
                    }

                    res.render('paymentControl', {
                        name: req.user.name,
                        flatsShownNav: req.flatsShow,//show flats in left navigation menu
                        calendar: req.calendarShow,// calendar with months
                        typeOfHeat: req.blockData.heatType,
                        expenses: '',
                        results: ''
                    })
            } else {
                res.render('paymentControl', {
                    name: req.user.name,
                    flatsShownNav: req.flatsShow,//show flats in left navigation menu
                    calendar: req.calendarShow,
                    typeOfHeat: req.blockData.heatType,
                    expenses: '',
                    results: 'Δεν βρέθηκε Καταχώρηση για την επιλογή μήνα: ' + req.body.month
                })
            }
        })

    }//End of if else
})

module.exports = router;


