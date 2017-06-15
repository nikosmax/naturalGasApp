var express=require('express');
var path=require('path');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
var expressValidator = require('express-validator');
//var User=require('./models/user');

var router=express.Router();
var server=express();

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
server.use(require('./middlewares/users'));
server.use(require('./controllers'));
/*We load the controllers/index.js file.
Moreover, it is an index file, so we don’t
need to provide its name when requiring it,
we only need the folder name.*/

server.listen(6969,function(){
    console.log('Server started....');
})