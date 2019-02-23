const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true,
        trim: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: (email)=>validator.isEmail(email),
            message: `Provided email is not a valid email!`
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    tokens:[{
        access: {
            type: String,
            required: true
        },
        token:{
            type: String,
            required: true
        }
    }]
})

//method created on Model.methods Object turns it into a instance(document) method of that model 
//method created on Model.statics Object turns it into a Model method
// Model- User
//Instance- user

//Modified UserSchema Model Instance toJSON Method
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

//custom UserSchema Model Instance Method  
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, '123abc').toString();
    // user.tokens.push({access, token})
    user.tokens = user.tokens.concat([{access,token}]);
    return user.save().then(()=>{
        return token ;
    });
}

//custum UserSchema insatnce method
UserSchema.methods.removeToken = function(token){
    var user = this;
     return user.update({
        $pull: { tokens: {token} }
    })
};

//custom UserSchema Model Method
UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token, '123abc');
    }catch(e){
        // return new Promise((resolve, reject)=>{
        //     return reject('token invalid');
        // })
        return Promise.reject();
    }
    return User.findOne({
        _id: decoded._id,
        //for nested object property wrap in '' quotes
        'tokens.token': token,
        'tokens.access': 'auth' 
    });
}

//custom UserSchema Model Method
UserSchema.statics.findByCredentials = function(email,password){
    var User = this;
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return bcrypt.compare(password, user.password).then((res)=>{
            if(res){
                return Promise.resolve(user);
            }
            return Promise.reject();
        })
    })
}

//pre middleware for 'save' method on UserSchema Model for hashing password
UserSchema.pre('save', function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash(user.password, salt, function(err, hash){
                user.password = hash;
                return next(); 
            })
        })
    }else{
        return next();
    }
})

var User = mongoose.model("User", UserSchema)

module.exports = {User}