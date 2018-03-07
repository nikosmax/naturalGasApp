var express=require('express');
var router=express.Router();
var path=require('path');
var User=require('../models/user');
var sgMail=require('../middlewares/sendgrid');
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
        //if user exist
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

            //email preparation
            const msg = {
                to: newUser.username,
                from: 'stadio18@hotmail.com',
                subject: 'Welcome '+ req.body.name,
                text: 'and easy to do anywhere, even with Node.js',
                html: 'First Time SignUp',
                templateId: '6ed27339-1aca-4c55-adaf-146bc27e9ecb',
                //substitutions are for sendgrid template
                substitutions: {
                    name: req.body.name,
                    username: req.body.username ,
                    password: req.body.pwd
                }
            };
            //Sending email
            sgMail.send(msg,function(err,response){
                if(err) console.log(err);
                else
                    console.log('Yay! Our templated email has been sent');
            });

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

                //email preparation
                const msg = {
                    to: req.body.username,
                    from: 'stadio18@hotmail.com',
                    subject: 'Reset Password',
                    templateId: 'ff7f427b-a38e-44b5-ae7b-46fbd1adc82d',
                    //substitutions are for sendgrid template
                    substitutions: {
                        host: req.headers.host,
                        token: token ,
                        passExpires: passExpires
                    }
                };
                //Sending email
                sgMail.send(msg,function(err,response){
                    if(err) console.log(err);
                    else
                        console.log('Yay! Our templated email for password reset has been sent');
                });
            })//end of crypto
            res.render('forgot',{
                errors: 'An e-mail has been sent to '+ req.body.username
            })
        }//end of else
    })
})

//Reset password
router.get('/reset/:token',function(req,res){
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
                });
            }
        }
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