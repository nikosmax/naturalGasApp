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

//Logout page
router.get('/logout',function(req,res){
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

//User profile page
router.get('/profile',requireLogin,function(req,res){
    User.getUsers(function(err,users) {
        if (err) throw err;
        //console.log(users);
       // res.json(users);
    })
    res.render('profile',{
        name: req.user.name
    });

})

router.post('/users/add',function(req,res){
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('username','Email is Required').notEmpty();
    req.checkBody('pwd','Password is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('signup',{
            errors:errors
        })
    }else{
        var newUser=new User({
            name: req.body.name,
            username:req.body.username,
            password:req.body.pwd
        })

      //  User.findOne({name: newUser.name},function(err,user){
     //      if(err) throw err;
      //      console.log(user.name + '  exist');
     //   })

        newUser.save(function(err){
            if (err) console.log(err);

            else console.log('User saved successfully');
        })
        //console.log(newUser);
        res.redirect('/profile');
    }
})

router.post('/login',function(req,res){
    req.checkBody('username','User Name is Required').notEmpty();
    req.checkBody('pwd','last Name is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors){
        console.log("errors");
        res.render('login');
    }else{
        User.findOne({username: req.body.username},function(err,user){
        if(err) throw err;
            if(!user){
                res.render('login',{
                    errors: 'invalid user'
                });
            }else if(req.body.pwd === user.password){
                // sets a cookie with the user's info
                req.session.user=user;
                res.redirect('/profile');
                console.log('Successful login');
            }
        })
    }
})

function requireLogin (req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
};

module.exports = router;