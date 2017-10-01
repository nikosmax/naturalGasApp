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

router.get('/database/block',function(req,res){
    Block.find(function(err,block){
        if (err) console.log(err);

        var i=-1;
        var usersN=[];

        var loop=function() {
            i++;
            if (i === block.length){
                res.render('admin/block',{
                    username:usersN,
                    block:block,
                    db:req.dbCol
                })
                return;
            }
            User.findOne({_id:block[i].user},function(err,user){
                usersN.push(user.name);
                loop();
            })
        }
        loop();
    })
})

router.get('/database/flat',function(req,res){
    Flat.find(function(err,flat) {
        if (err) console.log(err);
        res.render('admin/flat', {
            flat: flat,
            db: req.dbCol
        })
    })
})

router.get('/database/expense',function(req,res){
    Expenses.find(function(err,expenses) {
        if (err) console.log(err);
        res.render('admin/expenses', {
            expenses: expenses,
            db: req.dbCol
        })
    })
})

module.exports = router;