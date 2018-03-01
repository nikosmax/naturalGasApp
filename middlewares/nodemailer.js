var nodemailer = require('nodemailer');

/* create reusable transporter object using the default
SMTP transport*/

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'dionisis.ef@gmail.com',
        pass: ''
    }
});

module.exports=transporter;
