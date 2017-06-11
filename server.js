var express=require('express');
var path=require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var router=express.Router();
var server=express();

//view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs'); // set up ejs for templating

//middlewares
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(require('./middlewares/users'));
server.use(require('./controllers'));
/*We load the controllers/index.js file.
Moreover, it is an index file, so we don’t
need to provide its name when requiring it,
we only need the folder name.*/

server.listen(6969,function(){
    console.log('Server started....');
})