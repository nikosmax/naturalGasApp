var express=require('express');
var router=express.Router();

//Home page
router.get('/',function(req,res){
    res.render('index');
})

//Login page
router.get('/login',function(req,res){
    res.render('login');
})

//SignUp page
router.get('/signup',function(req,res){
    res.render('signup');
})

//About page
router.get('/about',function(req,res){
    res.render('about');
})

router.post('/users/add',function(req,res){
    req.checkBody('email','First Name is Required').notEmpty();
    req.checkBody('pwd','last Name is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors){
        console.log("errors");
    }else{
        console.log('success');
    }

})

module.exports = router;