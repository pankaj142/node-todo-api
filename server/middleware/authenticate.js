const {User} = require('../models/user');

const authenticate = (req,res,next)=>{
    var token = req.header('x-auth');
    User.findByToken(token)
        .then((user)=>{
            if(!user){
                // res.status(401).send(); //similarly we can return reject Promise that will handle in catch 
                return Promise.reject('no user found');
            }
            req.user = user;
            req.token = token;
            next();
        })
        .catch((err)=>{
            res.status(401).send({err});
        });
}

module.exports = {authenticate};