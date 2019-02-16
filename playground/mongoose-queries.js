const {Todos} = require('../server/models/todos');
const {Users} = require('../server/models/user')
const mongoose = require('../server/db/mongoose');
const {ObjectId} = require('mongodb');

//users apis - find, findById 
let userId = '5c659c519262250e84b51c32';
Users.find({_id: userId}).then((users)=>{
    if(!users){
        return console.log('No user is present. - find')
    }
    console.log('Users - find', JSON.stringify(users, undefined, 2))
}).catch((err)=>{
    console.log('Users - find - error',JSON.stringify(err,undefined, 2))
})

Users.findById(userId).then((users)=>{
    if(!users){
        return console.log('No user is present. - findById')
    }
    console.log('Users - findbyid',JSON.stringify(users,undefined, 2))
}).catch((err)=>{
    console.log('Users - findbyid - error',JSON.stringify(err,undefined,2 ))
})

//todos apis - find, findOne, findById
var todoId = '5c681219a76dbe1928ca6562';
if(!ObjectId.isValid(todoId)){
    console.log('todoId object id is not valid')
}
Todos.find({_id : todoId}).then((todos)=>{
    if(!todos){
        return console.log('No todo is present. - find')
    }
    console.log('Todos - find',JSON.stringify(todos,undefined, 2))
}).catch((err)=>{
    console.log('Todos - find - error',JSON.stringify(err,undefined, 2))
})

Todos.findOne({_id : todoId}).then((todos)=>{
    if(!todos){
        return console.log('No todo is present. - findOne')
    }
    console.log('Todos - findOne',JSON.stringify(todos,undefined, 2))
}).catch((err)=>{
    console.log('Todos - findOne - error',JSON.stringify(err,undefined, 2))
})

Todos.findById(todoId).then((todo)=>{
    if(!todo){
        return console.log('No todo is present. - findById')
    }
    console.log('Todos - findById',JSON.stringify(todos,undefined, 2))
}).catch((err)=>{
    console.log('Toods - findById  -error',JSON.stringify(err,undefined, 2))
})