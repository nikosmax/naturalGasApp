var express=require('express');
var router=express.Router();
var User=require('../models/user');

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

//User profile page
router.get('/profile',function(req,res){
    User.getUsers(function(err,users) {
        if (err) throw err;
        console.log(users);
       // res.json(users);
    })
    res.render('profile');

})

router.post('/users/add',function(req,res){
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('username','First Name is Required').notEmpty();
    req.checkBody('pwd','last Name is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors){
        console.log("errors");
    }else{
        var newUser=new User({
            name: req.body.name,
            username:req.body.username,
            password:req.body.pwd
        })

        newUser.save(function(err){
            if (err) throw err;

            else console.log('User saved successfully');
        })
        console.log(newUser);
        res.redirect('/profile');
    }

})

router.post('/users/login',function(req,res){
    req.checkBody('username','First Name is Required').notEmpty();
    req.checkBody('pwd','last Name is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors){
        console.log("errors");
    }else{
        console.log('success');
    }

})

module.exports = router;