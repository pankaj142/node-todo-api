require('./config/config');

const mongoose = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const port = process.env.PORT;

//middlewares
const {authenticate} = require('./middleware/authenticate');

//Models
var {Todos} = require('./models/todos');
var {User} = require('./models/user');

const app = express();
// app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

//Routes - Todos
app.delete('/todos/:id', (req,res)=>{
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }

    Todos.findByIdAndDelete(id).then((todo)=>{
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

//update todo
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

//Routes - Users
app.post('/users', (req,res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    var newUser = new User(body);
    newUser.save().then((newUser)=>{
        return newUser.generateAuthToken();
    }) 
    .then((token)=>{//chaining promise of generateAuthToken()
        res.header('x-auth',token).send(newUser);
    })
    .catch((err)=>{
        res.status(400).send(err);
    })
})

app.post('/users/login', (req,res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email,body.password)
        .then((user)=>{
            user.generateAuthToken().then((token)=>{
                res.header('x-auth', token).status(200).send(user);
            });
        })
        .catch((err)=>{
            res.status(400).send(err)
        })
    
    // console.log('req',req.body)
    // User.findOne({email: req.body.email}).then((user)=>{
    //     // console.log('sucess user', user)
    //     return bcrypt.compare(req.body.password, user.password);
    // })
    // .then((passwordMatch)=>{
    //     if(passwordMatch){
    //         return res.status(200).header('token', user.tokens[0].token).send();
    //     }
    //     return res.status(401).send();
    // })
    // .catch((err)=>{
    //     res.status(404).send(err +'ccccc');
    // })
})

app.listen(port, (err)=>{
    console.log(`Server is running at port ${port}`)
});

//private route
app.get('/users/me', authenticate, (req,res)=>{
    res.send(req.user);
})

module.exports = {app};