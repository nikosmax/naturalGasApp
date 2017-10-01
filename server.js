var express=require('express');
var path=require('path');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
var session = require('client-sessions');

var User=require('./models/user');//database for user configutation
var Block=require('./models/block');//database for block configutation
//var router=express.Router();
var server=express();
var dbCollection=[];
//connect to database test;
mongoose.connect('mongodb://localhost/test');
var db=mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once('open', function() {
    console.log("Connection to database succeeded.");
    Object.keys(db.models).forEach(function(collection) {
        dbCollection.push(collection);//show database collections
    });
});



//view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs'); // set up ejs for templating

//middlewares
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
//Set static path to public folder
server.use(express.static(path.join(__dirname,'public')));
server.use(function(req,res,next){
    req.dbCol=dbCollection;
    res.locals.dbCol=dbCollection;
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
//set cookie with user info
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
})
//set cookie with block info
server.use(function(req,res,next){
    if (req.session && req.session.user) {
        Block.findOne({user: req.session.user._id}, function (err, block) {
            if (err) console.log(err);
            if (block) {
                req.blockData = block;
                req.session.blockData = block;
                res.locals.blockData = block;
            } else {
                req.blockData = {};
                res.locals.blockData = {};
            }
            next();
        })
    }else next();
})

server.use(require('./middlewares/users'));
server.use(require('./controllers'));
/*We load the controllers/index.js file.
Moreover, it is an index file, so we don’t
need to provide its name when requiring it,
we only need the folder name.*/

server.listen(6969,function(){
    console.log('Server started....');
})