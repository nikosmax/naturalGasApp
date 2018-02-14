var express=require('express');
var router=express.Router();
var path=require('path');
var User=require('../models/user');
var transporter=require('../middlewares/nodemailer');
var sgMail=require('../middlewares/sendgrid');
var EmailTemplate = require('email-templates').EmailTemplate;
var crypto = require('crypto');
/*
 For each of your email templates (e.g. a welcome email to send to
 users when they register on your site),respectively name and create a folder.
 for example :  templates/welcomeEmail

 Then we Add the following files inside the template's folder:
 html.{{ext}} (required) - for html format of email
 text.{{ext}} (optional) - for text format of email
 style.{{ext}}(optional) - styles for html format
 subject.{{ext}}(optional) - for subject of email

 Because we use ejs view engine we put html.ejs,text.ejs etc
 Finally we add a path to where template is
 var emailTemplate=path.join(__dirname,'../views/templates','welcomeEmail');
 var welcomeEmail=new EmailTemplate(emailTemplate);
 */

/*
 It loads the router with its routes and defines a prefix for all the
 routes loaded inside.The prefix part is optional.
 */
router.use('/users', require('./users'));
router.use('/admin', require('./admin'));

//Home page
router.get('/',function(req,res){
    if(typeof req.user==='undefined'){
        const msg = {
            to: 'dionisis.ef@gmail.com',
            from: 'stadio18@hotmail.com',
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: 'First Time SignUp',
            templateId: '6ed27339-1aca-4c55-adaf-146bc27e9ecb',
            substitutions: {
                name: 'Some One',
                username: 'Denver',
                password:'sta'
            }
        };

        sgMail.send(msg);
        res.render('index');
    } else{
        res.render('index',{
            usrnm:req.user.username
        });
    }
})
//for testing
router.get('/loaderio-34b2fba11dc87f73e38068a9413235ff',function(req,res){
res.send('loaderio-34b2fba11dc87f73e38068a9413235ff');
})

//Login page
router.get('/login',function(req,res){
    res.render('login');
})

//Forgot password
router.get('/forgot',function(req,res){
    res.render('forgot');
})

//Reset password
router.get('/reset/:token',function(req,res){
    console.log(req.params.token);
    User.findOne({resetPasswordToken: req.params.token},function(err,user){
        if (err) console.log(err);
        if(!user){
            console.log('Password reset token is invalid or has expired.');
            res.render('reset',{
                errors: 'Password reset token is invalid or has expired.',
                message:'',
                token:''
            })
        }
        if(user){
            var timeSet=user.resetPasswordExpires.getTime();
            var timeNow=Date.now();
            if(timeNow > timeSet){
                console.log('Password expired');
                res.render('reset',{
                    errors: 'Password reset token is invalid or has expired.',
                    message: '',
                    token:''
                })
            }else{
                console.log('User reset ok');
                res.render('reset',{
                    errors:'',
                    message:'',
                    token: req.params.token
,                });
            }
        }
    })
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
    var emailTemplate=path.join(__dirname,'../views/templates','welcomeEmail');
    var welcomeEmail=new EmailTemplate(emailTemplate);

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
            if(req.body.username==='admin@admin.com'){
                res.redirect('/admin/adminPage');
            }else{
                res.redirect('/users/profile');
            }

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
                        if(req.body.username==='admin@admin.com'){
                            res.redirect('/admin/adminPage');
                        }else{
                            res.redirect('/users/profile');
                        }
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

router.post('/forgot',function(req,res){
    var emailTemplate=path.join(__dirname,'../views/templates','resetPassword');
    var resetPassword=new EmailTemplate(emailTemplate);

    User.findOne({username: req.body.username},function(err,user){
        if (err) console.log(err);
        if(!user){
            console.log('User not exist');
            res.render('forgot',{
                errors:'No account with that email address exists.'
            })
        }else{
            /*
             create token
             crypto library  it is part of Node.js.
             We will be using it for generating random token during a password reset.
             */
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                var passExpires=Date.now() + 3600000; // 1 hour
            //put token and expire in database users
                user.resetPasswordToken = token;
                user.resetPasswordExpires = passExpires;
            //save to database
                user.save(function(err){
                    if (err) console.log(err);
                })
                //email send
                resetPassword.render({host: req.headers.host, token: token , passExpires: passExpires},function(err,results){
                    if(err) return console.log(err);

                    var mailOptions = {
                        from: 'dionisis.ef@gmail.com',
                        to: req.body.username,
                        subject: 'Reset Password',
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
            })//end of crypto
            res.render('forgot',{
                errors: 'An e-mail has been sent to '+ req.body.username
            })
        }//end of else
    })
})

router.post('/reset/:token',function(req,res){
User.findOne({resetPasswordToken: req.params.token},function(err,user){
    if(err) console.log(err);
    if(!user){
        console.log('Password reset token is invalid or has expired.');
        res.render('reset',{
            errors: 'Password reset token is invalid or has expired.',
            message:''
        })
    }else {
        if (req.body.pwd != req.body.pwd1) {
            res.render('reset', {
                message: 'Passwords dont match',
                token:req.params.token
            })
        } else {
            user.password = req.body.pwd;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            //save to database
            user.save(function (err) {
                if (err) console.log(err);
                console.log('user saved');
                res.redirect('/login');
            })
        }//end of else
    }//end of else
  })
})

module.exports = router;