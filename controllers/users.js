var express=require('express');
var router=express.Router();
var User=require('../models/user');

//User profile page
router.get('/profile',requireLogin,function(req,res){
    var d=new Date(req.user.created_date);
    var mydate= d.getDate()+'-'+ (d.getMonth()+1)+'-'+ d.getFullYear();
    res.render('profile',{
        name: req.user.name,
        username:req.user.username,
        date:mydate
    });
})

router.get('/block',requireLogin,function(req,res){
    res.render('block',{
        name: req.user.name
    });
})

router.post('/updateProfile',function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err) throw err;
        user.name=req.body.name;
        user.username=req.body.username;

        user.save(function(err,update){
            if(err) throw err;
            console.log('update');
            res.redirect('profile');
        })
    })
})

module.exports = router;

function requireLogin (req, res, next) {
    if (!req.user)
    {
        res.redirect('/login');
    }
    else
    {
        next();
    }
}