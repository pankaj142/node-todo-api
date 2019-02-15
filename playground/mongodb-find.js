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

    db.collection('Todos').find().toArray().then((docs)=>{
        console.log("TOODOS...");
        console.log(JSON.stringify(docs,undefined,2))
    },(err)=>{
        console.log("Unable to fetch TODOS...",err)
    })

    Client.close();
})