var express=require('express');
var router=express.Router();
var User=require('../models/user');
var Block=require('../models/block');
var Flat=require('../models/flat');

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

router.use(function flatsShowNav(req,res,next){
    Block.findOne({user:req.user._id},function(err,block) {
        if (block){
            Flat.find({}, function (err, flats) {
                if (flats) {
                    req.flatsShow = flats;
                    res.locals.flatsShow = flats;
                    next();
                } else {
                    next();
                }
            })
        }else next();
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
        flatsShownNav:req.flatsShow
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
        address: block.address,
        location: block.location,
        postal: block.postal,
        nameRes: block.nameRes,
        phone: block.phone,
        mobile: block.mobile,
        heatType: block.heatType,
        totalFlats:block.totalFlats,
        flatsShownNav:req.flatsShow,
        flag: 1
    });
    }else{
            res.render('block', {
            name: req.user.name,
            address: '',
            location: '',
            postal: '',
            nameRes: '',
            phone: '',
            mobile: '',
            heatType: '',
            totalFlats:'',
            flatsShownNav:req.flatsShow,
            flag: 0
        });
    }
})
})

//block post first time contents
router.post('/block',function(req,res){
    var newBlock= new Block({
        address:    req.body.address,
        location:   req.body.location,
        postal:     req.body.postal,
        nameRes:    req.body.nameRes,
        phone:      req.body.phone,
        mobile:     req.body.mobile,
        heatType:   req.body.heatType,
        totalFlats: req.body.totalFlats,
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
            heatType:   newBlock.heatType,
            totalFlats: newBlock.totalFlats,
            flatsShownNav:req.flatsShow,
            flag:       1
        });
    })
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
            block.totalFlats=req.body.totalFlats;

        block.save(function(err,update){
            if(err) console.log(err);
            console.log('block updated');
            res.redirect('block');
        })
    })
})

//Flat page
router.get('/flat',function(req,res){
    Flat.count({},function(err,count){
        if (err) console.log(err);
        res.render('flat',{
            name: req.user.name,
            flatsCount:req.blockData.totalFlats,
            count:count,
            flatsShownNav:req.flatsShow,
            flat: 'undefined'
        });
    })
})

//block post first time contents
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
                owner: req.body.owner,
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
                    count:count,
                    flatsShownNav:req.flatsShow,
                    errors: 'Δεν υπάρχει καταχωρημένη πολυκατοικία'
                })
            })
        }
    })
})

router.get('/flat/:flatId',function(req,res){
    Flat.findOne({_id: req.params.flatId},function(err,flat){
        if(err) console.log(err);
        res.render('flat',{
            name: req.user.name,
            flatsCount:req.blockData.totalFlats,
            flatsShownNav:req.flatsShow,
            count:'',
            flat:flat
        })
    })
})

//Month expenses
router.get('/monthexpenses',function(req,res){
    res.render('monthExpenses',{
        name: req.user.name,
        flatsShownNav:req.flatsShow
    });
})

module.exports = router;


