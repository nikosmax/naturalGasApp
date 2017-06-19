var express=require('express');
var router=express.Router();
var User=require('../models/user');
var Block=require('../models/block')

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

router.post('/block',requireLogin,function(req,res){
    var newBlock= new Block({
        address:    req.body.address,
        location:   req.body.location,
        postal:     req.body.postal,
        nameRes:    req.body.nameRes,
        phone:      req.body.phone,
        mobile:     req.body.mobile,
        heatType:   req.body.heatType,
        user :      req.user._id
    })

    newBlock.save(function(err){
        if (err) console.log(err);
        else console.log('Block saved successfully');
        res.render('block',{
            name:       req.user.name,
            address:    newBlock.address,
            location:   newBlock.location,
            postal:     newBlock.postal,
            nameRes:    newBlock.nameRes,
            phone:      newBlock.phone,
            mobile:     newBlock.mobile,
            heatType:   newBlock.heatType
        });
    })
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