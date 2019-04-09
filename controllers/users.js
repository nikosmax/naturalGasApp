var express=require('express');
var router=express.Router();
var User=require('../models/user');
var paypal=require('../middlewares/paypal');
var months=["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μαιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος",
    "Νοέμβριος","Δεκέμβριος"];

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
    //everything starts with req.user is from user cookie session
    var d=new Date(req.user.created_date);
    var mydate= d.getDate()+'-'+ (d.getMonth()+1)+'-'+ d.getFullYear();
    //If validUntil is not undefined is equal with the date until else its equal to 'Αγόρασε μονάδες'
    var validUntil=typeof req.user.validUntil!=='undefined'? months[(req.user.validUntil).getMonth()]+'-'+ (req.user.validUntil).getFullYear():'Αγόρασε Μονάδες';

    //console.log(req.flatsShow);
    res.render('profile',{
        name: req.user.name,//name of user display in left menu
        username:req.user.username,//user name is email of user
        date:mydate,//date of register
        credits:req.user.credits,//User credits on first time register equal to zero
        validUntil:validUntil,//User is validated until this date
        flatsShownNav:req.flatsShow,//list of flat taken from res.local
        calendar:req.calendarShow//Calendar with months on left menu .
    });
})

//Update profile
router.post('/updateProfile',function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err) console.log(err);
        user.name=req.body.name;//from form
        user.username=req.body.username;//from form

        user.save(function(err,update){
            if(err) throw err;
            console.log('update');
            res.redirect('profile');
        })
    })
})

//Add Credits page
router.get('/addCredits',function(req,res){
    var d=new Date(req.user.created_date);
    var mydate= d.getDate()+'-'+ (d.getMonth()+1)+'-'+ d.getFullYear();
    res.render('addCredits',{
        name: req.user.name,
        username:req.user.username,
        date:mydate,
        flatsShownNav:req.flatsShow,
        calendar:req.calendarShow
    });
})

//Add Credits page
router.post('/addCredits',function(req,res){
if(req.body.typeOfPayment==='paypal'){

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:6969/users/success",
            "cancel_url": "http://localhost:6969/users/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Credits",
                    "sku": "item",
                    "price": req.body.credits,
                    "currency": "EUR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "EUR",
                "total": req.body.credits
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            //console.log(payment);
            var redirectUrl;
            for(var i=0; i < payment.links.length; i++) {
                var link = payment.links[i];
                if (link.method === 'REDIRECT') {
                    redirectUrl = link.href;
                }
            }
            res.redirect(redirectUrl);
        }
    });
}else{

}
})

router.get('/success', function(req, res) {
  var paymentId = req.query.paymentId;
  var payerId = { 'payer_id': req.query.PayerID };
  //If validUntil is equal to Αγόρασε Μονάδες then dateNow is equal to new Date else is equal to validUntil Date
  var dateNow=req.user.validUntil==='Αγόρασε Μονάδες'? new Date():req.user.validUntil;

  paypal.payment.execute(paymentId, payerId, function(error, payment){
    if(error){
        console.log(error);
    } else {
      if ( payment.state === 'approved' ) {
          //console.log(payment['transactions'][0]['amount']['total']);
          User.findById(req.user._id,function(err,user){
              if(err) console.log(err);
              user.credits+=Number(payment['transactions'][0]['amount']['total']);
              dateNow.setMonth(dateNow.getMonth()+Number(payment['transactions'][0]['amount']['total']));
              user.validUntil=dateNow;

              user.save(function(err,update){
                  if(err) throw err;
                  console.log('update');
              })
          })
          res.render('success',{
              name: req.user.name,
              username:req.user.username,
              flatsShownNav:req.flatsShow,
              calendar:req.calendarShow,
              amount:payment['transactions'][0]['amount']['total']
          });
      } else {
          res.send('payment not successful');
      }
    }
  });
});

module.exports = router;
