var mongoose=require('mongoose');
var bcrypt=require('bcrypt');
var Schema=mongoose.Schema;
SALT_WORK_FACTOR=10;//how many rounds or iterations the key setup phase uses

var userSchema=new Schema({
    name: String,
    username:{type:String,required: true,unique:true},
    password:{type:String,required:true},
    created_date:{type:Date,default:Date.now},
    credits: Number,
    validUntil: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.pre('save',function(next){
    var user=this;

    //// only hash the password if it has been modified (or is new)
    if(!user.isModified('password')) return next();

    //generate salt
    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        if(err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password,salt,function(err,hash){
            if(err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

//create the mongoose Model by calling mongoose.model.
var User=mongoose.model('User',userSchema);

module.exports=User;

//Get users
module.exports.getUsers=function(callback,limit){
    User.find(callback).limit(limit);
}

module.exports.findOneUser=function(callback){
    User.findOne(callback);
}