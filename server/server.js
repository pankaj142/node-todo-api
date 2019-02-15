const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');

//Models
var Todos = require('./models/todos');
var User = require('./models/user');

const app = express();
// app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.post('/todos', (req,res)=>{
    let newTodo = new Todos({
        text : req.body.text,
    });
    newTodo.save().then((doc)=>{
        res.send(doc);
    }).catch((err)=>{
        res.status(400).send(err);
    })
});

app.get('/',(req,res)=>{
    res.send("hello")
})
app.listen(3000, (err)=>{
    console.log("Server is accepting requests on port 3000.")
});

module.exports = {app}