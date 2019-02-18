const {Todos} = require('../server/models/todos');
const {Users} = require('../server/models/user')
const mongoose = require('../server/db/mongoose');
const {ObjectId} = require('mongodb');

// Todos.deleteMany().then((result)=>{
//     console.log('remove', result)
// })
// Todos.deleteOne({_id:'5c6a997504f48a18e48bb1f7'}).then((result)=>{
//     console.log('deleteOne ', result)
// })

// Todos.findByIdAndDelete({_id:'5c6a996b04f48a18e48bb1f6'}).then((result)=>{
//     console.log('findByIdAndDelete',result)
// })

Todos.findOneAndDelete({_id:'5c6a9ae104f48a18e48bb1f9'}).then((result)=>{
    console.log('findOneAndDelete',result)
})
Todos.findOneAndRemove({_id: '5c6a9ad904f48a18e48bb1f8'}).then((result)=>{
    console.log('findOneAndRemove',result)
})