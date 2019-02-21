const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
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
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

//custom method on mongoose UserSchema Model.methods object
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString()}, '123abc').toString();
    // user.tokens.push({access, token})
    user.tokens = user.tokens.concat([{access,token}]);
    return user.save().then(()=>{
        return token ;
    });
}

//
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

var User = mongoose.model("User", UserSchema)

module.exports = {User}