const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const {ObjectId} = require('mongodb');
const port = process.env.PORT;
const _ = require('lodash');

//Models
var {Todos} = require('./models/todos');
var User = require('./models/user');

const app = express();
// app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.delete('/todos/:id', (req,res)=>{
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }

    Todos.findByIdAndDelete(id).then((todo)=>{
        // console.log('result',todo)
        if(!todo){
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((error)=>{
        res.status(400).send({});
    })
})

app.get('/todos/:id', (req,res)=>{
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send({});
    }

    Todos.findById(req.params.id).then((todo)=>{
        if(!todo){
            return res.status(404).send({})
        }
        res.send({todo});
    }).catch((err)=>{
        res.status(400).send({})
    })
})

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

app.get('/todos', (req,res)=>{
    Todos.find({}).then((todos)=>{
        res.send({todos});
    }).catch((err)=>{
        res.status(400).send(err)
    })
});

app.get('/',(req,res)=>{
    res.send("hello")
})

app.patch('/todos/:id', (req,res)=>{
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }
    
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt = null;
    }

    Todos.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            res.send({todo})
        }).catch((err)=>{
            res.status(400).send()
        })
})

app.listen(port, (err)=>{
    console.log(`Server is running at port ${port}`)
});

module.exports = {app};