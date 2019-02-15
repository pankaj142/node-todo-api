const {MongoClient, ObjectId} = require('mongodb');

var id = new ObjectId();
console.log("id",id.getTimestamp())
const url = 'mongodb://localhost:27017/TodoApp';
MongoClient.connect(url, (err, Client)=>{
    if(err){
        return console.log("Couldn't connect to mongodb Server.");
    }
    console.log("Connected to Mongodb Server.");
    const db = Client.db('TodoApp');

    // db.collection('Todos').insertOne({
    //  text: "some text s",
    //  completed: false   
    // }, (err, result)=>{
    //     if(err){
    //         return console.log("Unable to insert todo...",err)
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2))
    // })

    // db.collection('Users').insertOne({
    //     name: 'Pankaj A',
    //     age: 27,
    //     location: 'Pune'
    // }, (err, result)=>{
    //     if(err){
    //         return console.log("Unable to insert User...", err)
    //     }
    //     console.log(JSON.stringify(result.ops, undefined,2))
    // })
    Client.close();
})