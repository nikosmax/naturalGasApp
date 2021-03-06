var express=require('express');
var router=express.Router();
var User=require('../models/user');


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

router.get('/adminPage',function(req,res){
    res.render('admin/adminPage',{
        db:req.dbCol
    });
})

router.get('/adminUsers',function(req,res){
    User.find(function(err,users){
        if (err) console.log(err);
        res.render('admin/adminUsers',{
            users:users,
            db:req.dbCol
        });
    })
})

router.get('/database',function(req,res){
        res.render('admin/database',{
            db:req.dbCol
        });
})

module.exports = router;