var express=require('express');
var router=express.Router();
var path=require('path');
var User=require('../models/user');
var transporter=require('../middlewares/nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;

/*
 For each of your email templates (e.g. a welcome email to send to
 users when they register on your site),
 respectively name and create a folder.
 for example :  templates/welcomeEmail

 Then we Add the following files inside the template's folder:
 html.{{ext}} (required) - for html format of email
 text.{{ext}} (optional) - for text format of email
 style.{{ext}}(optional) - styles for html format
 subject.{{ext}}(optional) - for subject of email

 Because we use ejs view engine we put html.ejs,text.ejs etc
 Finally we add a path to where template is
 */
var emailTemplate=path.join(__dirname,'../views/templates','welcomeEmail');
var welcomeEmail=new EmailTemplate(emailTemplate);

/*
 It loads the router with its routes and defines a prefix for all the
 routes loaded inside.The prefix part is optional.
 */
router.use('/users', require('./users'));

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
    console.log('Logout');
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

router.post('/signup',function(req,res){
    User.findOne({username: req.body.username},function(err,user){
        if(err) throw err;
    var messages=[];
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('username','Email is Required').notEmpty();
    req.checkBody('pwd','Password is Recuired').notEmpty();
    var errors=req.validationErrors();
      if(errors){
          errors.forEach(function(error){
              messages.push(error.msg); //push errors msg to messages array
          })
      }

        if(user){
            messages.push('Username not Availiable');
        }

        if(messages[0]!=null){
            console.log(messages);
            res.render('signup',{
                errors:messages
            })
        }else {
            var newUser=new User({
                name: req.body.name,
                username:req.body.username,
                password:req.body.pwd
            })
            //save to database users
            newUser.save(function(err){
                if (err) console.log(err);
                else console.log('User saved successfully');
            })
            //console.log(newUser);
            res.redirect('/users/profile');

            //email send
    welcomeEmail.render({name: req.body.name,username:req.body.username, password:req.body.pwd},function(err,results){
            if(err) return console.log(err);

            var mailOptions = {
               from: 'dionisis.ef@gmail.com',
               to: newUser.username,
               subject: 'Welcome',
               html: results.html
           };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            })
          })
        }//end of else
    })
})

router.post('/login',function(req,res){
    req.checkBody('username','User Name is Required').notEmpty();
    req.checkBody('pwd','Password is Recuired').notEmpty();

    var errors=req.validationErrors();

    if(errors)
    {
        console.log("errors");
        res.render('login');
    }
    else
    {
        User.findOne({username: req.body.username},function(err,user){
            if(err) throw err;
            if(!user)
            {
                res.render('login',{
                    errors: 'invalid user'
                });
            }
            else
            {
                user.comparePassword(req.body.pwd, function(err, isMatch) {
                    if (err) throw err;
                    if(isMatch)
                    {
                         //sets a cookie with the user's info
                         req.session.user=user;
                        console.log('Successful login');
                         res.redirect('/users/profile');
                    }
                    else
                    {
                         console.log('wrong password');
                         res.render('login',{
                         errors: 'Wrong password'
                          });
                    }
                });
            }
        })
    }
})

module.exports = router;