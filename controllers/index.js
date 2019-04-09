var express=require('express');
var router=express.Router();
var path=require('path');
var User=require('../models/user');
var Material=require('../models/material');
var sgMail=require('../middlewares/sendgrid');
var crypto = require('crypto');
/*
 For each of your email templates (e.g. a welcome email to send to
 users when they register on your site),respectively name and create a folder.
 for example :  templates/welcomeEmail

 Then we Add the following files inside the template's folder:
 html.{{ext}} (required) - for html format of email
 text.{{ext}} (optional) - for text format of email
 style.{{ext}}(optional) - styles for html format
 subject.{{ext}}(optional) - for subject of email

 Because we use ejs view engine we put html.ejs,text.ejs etc
 Finally we add a path to where template is
 var emailTemplate=path.join(__dirname,'../views/templates','welcomeEmail');
 var welcomeEmail=new EmailTemplate(emailTemplate);
 */

/*
 It loads the router with its routes and defines a prefix for all the
 routes loaded inside.The prefix part is optional.
 */
router.use('/users', require('./users'));
router.use('/admin', require('./admin'));

//Home page
router.get('/',function(req,res){
    if(typeof req.user==='undefined'){
        res.render('index');
    } else{
        res.render('index',{
            usrnm:req.user.username
        });
    }
})
//for testing
router.get('/loaderio-34b2fba11dc87f73e38068a9413235ff',function(req,res){
res.send('loaderio-34b2fba11dc87f73e38068a9413235ff');
})

//Login page
router.get('/login',function(req,res){
    res.render('login');
})

//Forgot password
router.get('/forgot',function(req,res){
    res.render('forgot');
})

//Logout page
router.get('/logout',function(req,res){
    console.log('Logout');
    req.session.reset();
    res.redirect('/');
})

//SignUp page
router.get('/signup',function(req,res){
    res.render('signup');
})

//About page
router.get('/about',function(req,res){
    res.render('about');
})

//naturalgas page
router.get('/naturalGas',function(req,res){
    res.render('naturalgas');
})

router.post('/naturalGas',function(req,res){

    var pipeDn15 = {
        diatomi: 0.0161,
        inches: "1/2\"",
        dn: "DN15",
        cost: 22,
        electrovalve: 80
    }

    var pipeDn20 = {
        diatomi: 0.0217,
        inches: "3/4\"",
        dn: "DN20",
        cost: 22,
        electrovalve: 80
    }

    var pipeDn25 = {
        diatomi: 0.0273,
        inches: "1\"",
        dn: "DN25",
        cost: 29,
        electrovalve: 80
    }

    var pipeDn32 = {
        diatomi: 0.0360,
        inches: "1 1/4\"",
        dn: "DN32",
        cost: 34,
        electrovalve: 100
    }

    var pipeDn40 = {
        diatomi: 0.0419,
        inches: "1 1/2\"",
        dn: "DN40",
        cost: 47,
        electrovalve: 100
    }

    var pipeDn50 = {
        diatomi: 0.0531,
        inches: "2\"",
        dn: "DN50",
        cost: 52,
        electrovalve: 150
    }

    var pipeDn65 = {
        diatomi: 0.0689,
        inches: "2 1/2\"",
        dn: "DN50",
        cost: 60,
        electrovalve: 300
    }

    var heaters = {
        20000: 970,
        30000: 1037,
        40000: 1100
    }

//     1/2"	DN15	0,0161
// 3/4"	DN20	0,0217
// 1"	DN25	0,0273
// 1 1/4"	DN32	0,0360
// 1 1/2"	DN40	0,0419
// 2"	DN50	0,0531
// 2 1/2"	DN65	0,0689

    var diatomes = [pipeDn15, pipeDn20, pipeDn25, pipeDn32, 
                    pipeDn40, pipeDn50, pipeDn65];

    var meters = eval(req.body.meters); // μέτρα σωλήνα
    var turns = eval(req.body.angles);  // αριθμός γωνιών
    var Q = eval(req.body.kcal);//θερμίδες λέβητα
    var meleth = eval(req.body.gasStudy);//τιμή μελέτης
    var Adeksameni = eval(req.body.removeTank);//απομακρυνση δεξαμενής
    var Alevita = eval(req.body.changeHeater);//απομακρυνση λέβητα παλιού
    var anixneuths = eval(req.body.gasDetector);//ανιχνευτής αερίου
    var dH = eval(req.body.dH);

    var n = 0.85;// βαθμός απόδοσης λέβητα 
    var Hi = 10.3; // κατώτερη θερμογόνος δύναμη φυσικού αερίου σε KWh/m^3
    var pn = 0.79; // πυκνότητα φυσικού αερίου σε Kg/m^3
    var v = 0.000014; // δυναμικό ιξώδες ρευστού σε m^2/sec
    var k = 0.5; // τραχύτητα χαλυβδοσωλήνα σε mm

    var diatomesLength = diatomes.length;
    var index;
    for (var i = 0; i < diatomesLength; i++){ 
        var A = Math.PI*Math.pow(diatomes[i].diatomi/2,2); // επιφάνεια διατομής σωλήνα σε m^2
        var V= Q/(859*Hi*n); // παροχή
        var u= V/(A*3600); //ταχύτητα σωλήνα πρέπει να είναι < 6m/sec
        var Re= diatomes[i].diatomi*u/v; //αριθμός Reynolds
        var j=0.25/(Math.pow(Math.log10((k/(3700*diatomes[i].diatomi))+(5.74/Math.pow(Re,0.9))),2)); //αντίσταση ροής
        var Dp=j*pn*Math.pow(u,2)* meters/(2*100*diatomes[i].diatomi); // πτώση πίεσης σε σωλήνα  se mbar (υπαρχει το 100 στη σχέση απο Pa σε mbar)
        //πτώση πίεσης σε τοπικές αντιστάσεις 
        //(μετρητής+τ90 καθαρισμού+βαλβιδες σφαιρικές+γωνίες+φίλτρο) σε Pa
        var Dpt= (4*pn*Math.pow(u,2)/2) + 
                 (1.3*pn*Math.pow(u,2)/2) + 
                 (3*0.5*pn*Math.pow(u,2)/2) + 
                 (turns*0.7*pn*Math.pow(u,2)/2) + 
                 (2*pn*Math.pow(u,2)/2);
        var Dph= dH*(-0.04); // πτώση πίεσης λόγω άνωσης σε mbar
        var Dpol=Dp + Dpt/100 + Dph; // το  100 στη σχέση απο Pa σε mbar 
        if (Dpol < 2) {
            index = i;
            break;
        }    
    }

    var totalCost = heaters[Q] + anixneuths + meleth + Adeksameni + 
                    diatomes[index].electrovalve + diatomes[index].cost * meters;

    res.render('naturalGasResults',{
        meters: meters,
        q: Q,
        diatomi: diatomes[i].dn,
        dpol: Dpol.toFixed(2),
        cost: totalCost,
        changeHeater: Alevita == 0 ? "NO" : "YES",
        removeTank: Adeksameni == 0 ? "NO" : "YES",
        gasDetector: anixneuths == 0 ? "NO" : "YES"
    });
})

router.get('/setSupplier',function(req,res){
    res.render('supplier');
})

router.post('/setSupplier',function(req,res){
    req.checkBody('supplier','Ο προμηθευτής πρέπει να είναι συμπληρωμένος').notEmpty();
    //req.checkBody('location','Η διεύθυνση πρέπει να είναι συμπληρωμένη').optional({ checkFalsy: true }).isNumeric();
    //req.checkBody('email','Το πεδίο τηλέφωνο πρέπει να είναι συμπληρωμένο με αριθμούς').optional({ checkFalsy: true }).isNumeric();
    // req.checkBody('phone','Ο συνολικός αριθμός Διαμερισμάτων πρέπει να είναι συμπληρωμένος').isNumeric();
    // req.checkBody('mobile','Το πεδίο κινητό πρέπει να είναι συμπληρωμένο με αριθμούς').optional({ checkFalsy: true }).isNumeric();
    // req.checkBody('materialType','Ο συνολικός αριθμός Διαμερισμάτων πρέπει να είναι συμπληρωμένος').isNumeric();
    // req.checkBody('materialDescription','Ο τύπος θέρμανσης πρέπει να είναι επιλεγμένος').notEmpty();
    // req.checkBody('retailPrice','Το πεδίο Πάγιο θέρμανσης πρέπει να είναι συμπληρωμένο με αριθμούς').optional({ checkFalsy: true }).isNumeric();
    // req.checkBody('discount','Αποθεματικό Πρέπει να είναι αριθμός').optional({ checkFalsy: true }).isCurrency({allow_negatives: false,allow_decimal: true,require_decimal: false,digits_after_decimal: [1,2]});

    var errors=req.validationErrors();

    if(errors)
    {
        console.log(errors);
        res.render('supplier',{
            errors:errors
        })
    }else {

        var newMaterial = new Material({
            supplier:   req.body.supplier,
            location:   req.body.location,
            email:      req.body.email,
            phone:      req.body.phone,
            mobile:     req.body.mobile,
            materialType:   req.body.materialType,
            materialDescription:  req.body.materialDescription,
            retailPrice: req.body.retailPrice,
            discount:    req.body.discount
        })

        newMaterial.save(function(err){
            if (err) console.log(err);
            else console.log('Material saved successfully');
            res.render('supplier',{
            });
        })
    }
})

router.get('/suppliers',function(req,res) {
    Material.find({},function(err,materials) {
        if ( err ) {
            console.log(err);
        } else {
            console.log(materials);
            res.render('showSuppliers',{
                materials: materials
            })
        }
    })
})

router.post('/signup',function(req,res){
    User.findOne({username: req.body.username},function(err,user){
        if(err) throw err;
    var messages=[];
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('username','Email is Required').notEmpty();
    req.checkBody('pwd','Password is Recuired').notEmpty();
    var errors=req.validationErrors();
      if(errors){
          errors.forEach(function(error){
              messages.push(error.msg); //push errors msg to messages array
          })
      }
        //if user exist
        if(user){
            messages.push('Username not Availiable');
        }

        if(messages[0]!=null){
            console.log(messages);
            res.render('signup',{
                errors:messages
            })
        }else {
            var newUser=new User({
                name: req.body.name,
                username:req.body.username,
                password:req.body.pwd
            })
            //save to database users
            newUser.save(function(err){
                if (err) console.log(err);
                else console.log('User saved successfully');
            })
            if(req.body.username==='admin@admin.com'){
                res.redirect('/admin/adminPage');
            }else{
                res.redirect('/users/profile');
            }

            //email preparation
            const msg = {
                to: newUser.username,
                from: 'stadio18@hotmail.com',
                subject: 'Welcome '+ req.body.name,
                text: 'and easy to do anywhere, even with Node.js',
                html: 'First Time SignUp',
                templateId: '6ed27339-1aca-4c55-adaf-146bc27e9ecb',
                //substitutions are for sendgrid template
                substitutions: {
                    name: req.body.name,
                    username: req.body.username ,
                    password: req.body.pwd
                }
            };
            //Sending email
            sgMail.send(msg,function(err,response){
                if(err) console.log(err);
                else
                    console.log('Yay! Our templated email has been sent');
            });

        }//end of else
    })
})

router.post('/login',function(req,res){
    req.checkBody('username','User Name is Required').notEmpty();
    req.checkBody('pwd','Password is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors)
    {
        console.log("errors");
        res.render('login');
    }
    else
    {
        User.findOne({username: req.body.username},function(err,user){
            if(err) throw err;
            if(!user)
            {
                res.render('login',{
                    errors: 'invalid user'
                });
            }
            else
            {
                user.comparePassword(req.body.pwd, function(err, isMatch) {
                    if (err) throw err;
                    if(isMatch)
                    {
                         //sets a cookie with the user's info
                         req.session.user=user;
                        console.log('Successful login');
                        if(req.body.username==='admin@admin.com'){
                            res.redirect('/admin/adminPage');
                        }else{
                            res.redirect('/users/profile');
                        }
                    }
                    else
                    {
                         console.log('wrong password');
                         res.render('login',{
                         errors: 'Wrong password'
                          });
                    }
                });
            }
        })
    }
})

router.post('/forgot',function(req,res){
    User.findOne({username: req.body.username},function(err,user){
        if (err) console.log(err);
        if(!user){
            console.log('User not exist');
            res.render('forgot',{
                errors:'No account with that email address exists.'
            })
        }else{
            /*
             create token
             crypto library  it is part of Node.js.
             We will be using it for generating random token during a password reset.
             */
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                var passExpires=Date.now() + 3600000; // 1 hour
            //put token and expire in database users
                user.resetPasswordToken = token;
                user.resetPasswordExpires = passExpires;
            //save to database
                user.save(function(err){
                    if (err) console.log(err);
                })

                //email preparation
                const msg = {
                    to: req.body.username,
                    from: 'stadio18@hotmail.com',
                    subject: 'Reset Password',
                    templateId: 'ff7f427b-a38e-44b5-ae7b-46fbd1adc82d',
                    //substitutions are for sendgrid template
                    substitutions: {
                        host: req.headers.host,
                        token: token ,
                        passExpires: passExpires
                    }
                };
                //Sending email
                sgMail.send(msg,function(err,response){
                    if(err) console.log(err);
                    else
                        console.log('Yay! Our templated email for password reset has been sent');
                });
            })//end of crypto
            res.render('forgot',{
                errors: 'An e-mail has been sent to '+ req.body.username
            })
        }//end of else
    })
})

//Reset password
router.get('/reset/:token',function(req,res){
    User.findOne({resetPasswordToken: req.params.token},function(err,user){
        if (err) console.log(err);
        if(!user){
            console.log('Password reset token is invalid or has expired.');
            res.render('reset',{
                errors: 'Password reset token is invalid or has expired.',
                message:'',
                token:''
            })
        }
        if(user){
            var timeSet=user.resetPasswordExpires.getTime();
            var timeNow=Date.now();
            if(timeNow > timeSet){
                console.log('Password expired');
                res.render('reset',{
                    errors: 'Password reset token is invalid or has expired.',
                    message: '',
                    token:''
                })
            }else{
                console.log('User reset ok');
                res.render('reset',{
                    errors:'',
                    message:'',
                    token: req.params.token
                });
            }
        }
    })
})

router.post('/reset/:token',function(req,res){
User.findOne({resetPasswordToken: req.params.token},function(err,user){
    if(err) console.log(err);
    if(!user){
        console.log('Password reset token is invalid or has expired.');
        res.render('reset',{
            errors: 'Password reset token is invalid or has expired.',
            message:''
        })
    }else {
        if (req.body.pwd != req.body.pwd1) {
            res.render('reset', {
                message: 'Passwords dont match',
                token:req.params.token
            })
        } else {
            user.password = req.body.pwd;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            //save to database
            user.save(function (err) {
                if (err) console.log(err);
                console.log('user saved');
                res.redirect('/login');
            })
        }//end of else
    }//end of else
  })
})

module.exports = router;