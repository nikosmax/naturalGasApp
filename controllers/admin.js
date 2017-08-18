var express=require('express');
var router=express.Router();

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
    res.render('./admin/adminPage');
})


module.exports = router;