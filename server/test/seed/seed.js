const {Todos} = require('../../models/todos');
const {User} = require('../../models/user');
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');

var userOneId = new ObjectId();
var userTwoId = new ObjectId();

const dummyTodos = [{
    _id : new ObjectId(),
    text : "First Todo",
    completed: true,
    completedAt: 6666666,
    _creator: userOneId
},{
    _id : new ObjectId(),
    text : "second Todo",
    completed: true,
    completedAt: 44444444,
    _creator: userTwoId
},
{
    _id : new ObjectId(),
    text : "Third Todo new",
    _creator: userTwoId
}]

const dummyUsers = [
    {//logged in user as it contains token 
    _id: userOneId,
    email: 'dummyemail1@mail.com',
    password: 'dummyPassword1',
    tokens: [{
        access: 'auth',
        token : jwt.sign({_id: userOneId, access : 'auth'}, '123abc').toString()
    }]
},
{//no token- no logged in
    _id: userTwoId,
    email: 'dummyemail2@mail.com',
    password: 'dummyPassword2',
    tokens: [{
        access: 'auth',
        token : jwt.sign({_id: userTwoId, access : 'auth'}, '123abc').toString()
    }]
}];

const populateTodos = (done)=>{
    Todos.deleteMany({})
        .then(()=>{
            // console.log('deleted');
            return Todos.insertMany(dummyTodos);
        })
        .then(()=>{
            // console.log('inserted');
            done()
        })
        .catch((err)=>{
            done(err)
        })
}

const populateUsers = (done)=>{
    User.deleteMany({}).then(()=>{
        var userOne = new User(dummyUsers[0]).save();
        var userTwo = new User(dummyUsers[1]).save();
        return Promise.all([userOne,userTwo]);
    }).then(()=>done())
};
module.exports = {populateTodos, dummyTodos, populateUsers, dummyUsers};