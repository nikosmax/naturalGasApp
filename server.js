var express=require('express');
var path=require('path');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
//var expressValidator = require('express-validator');
var session = require('client-sessions');
var mailer = require('express-mailer');

var User=require('./models/user');//database for user configutation

//var router=express.Router();
var server=express();

mailer.extend(server, {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'dionisis.ef@gmail.com',
        pass: 'ek762000'
    }
});


//connect to database test;
mongoose.connect('mongodb://localhost/test');
var db=mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once('open', function() {
    console.log("Connection to database succeeded.");
});

//view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs'); // set up ejs for templating

//send email
server.mailer.send('email', {
    to: 'dionisis.ef@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
    subject: 'Test Email', // REQUIRED.
    otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
}, function (err) {
    if (err) {
        // handle error
        console.log(err);
        console.log('There was an error sending the email');
        return;
    }
    console.log('Email Sent');
});

//middlewares
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
//Set static path to public folder
server.use(express.static(path.join(__dirname,'public')));
server.use(function(req,res,next){
    res.locals.errors=null;
    next();
});
/*
 An object that contains response local variables scoped to the
 request, and therefore available only to the view(s) rendered
 during that request / response cycle (if any).
 This property is useful for exposing request-level information
 such as the request path name, authenticated user, user settings,
 and so on.
 */

server.use(session({
    cookieName: 'session',
    secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXKjhjhhhjh',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}))
server.use(function(req, res, next) {
    if (req.session && req.session.user) {
        User.findOne({ username: req.session.user.username }, function(err, user) {
            if (user) {
                req.user = user;
                delete req.user.password; // delete the password from the session
                req.session.user = user;  //refresh the session value
                res.locals.user = user;
            }
            // finishing processing the middleware and run the route
            next();
        });
    } else {
        next();
    }
});
server.use(require('./middlewares/users'));
server.use(require('./controllers'));
/*We load the controllers/index.js file.
Moreover, it is an index file, so we don’t
need to provide its name when requiring it,
we only need the folder name.*/

server.listen(6969,function(){
    console.log('Server started....');
})