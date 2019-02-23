//NOTE- use mocha 3.0.2 for avoiding some errors
const request = require('supertest');
const should = require('chai').should();
const expect = require('chai').expect;
const {app} = require('../server');
const {Todos} = require('../models/todos');
const {User} = require('../models/user');
const {ObjectId} = require('mongodb');
const {populateTodos, dummyTodos, populateUsers, dummyUsers} = require('./seed/seed');


// afterEach((done)=>{
//     Todos.deleteMany({}).then(()=>done());
// })

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('----------- TESTING ROUTES -------------', ()=>{
    describe('POST /todos', ()=>{
        it('should create a new todo.', (done)=>{//done beacuse its asychronous test 
            let testingText = "xxxxx";
            request(app)
               .post('/todos')
               .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
               .send({text : testingText})
               .expect(200)
               .expect((res)=>{
                   //assertion for response body
                    expect(res.body.text).to.have.lengthOf.above(4, "text length cannot be less 4"); 
                    res.body.text.should.equal(testingText);
               })
               .end((err,res)=>{
                   if(err){
                       return done(err);
                   }
                   //assertion about wheather expected data(todo) is saved on collection(todos) or not
                   Todos.find().then((todos)=>{
                       expect(todos.length).to.equal(4);
                       expect(todos[3].text).to.equal(testingText);
                       done();
                   }).catch((err)=>{
                       done(err)
                   })
               })
        })

        it('should not create todo with invalide body data.', (done)=>{
            request(app)
                .post('/todos')
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .send({})
                .expect(400)
                .end((err,res)=>{
                    if(err){
                        return done(err);
                    }
                    Todos.find().then((todos)=>{
                        expect(todos.length).to.equal(3);
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                })
        })
    })

    describe('GET /todos', ()=>{
        it('should get all todos', (done)=>{
            request(app)
                .get('/todos')
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(200)
                .expect((response)=>{
                    expect(JSON.parse(response.text).todos.length).to.equal(1);
                })
                .end(done);
        })
    })

    describe('GET /todos/:id', ()=>{
        it('should return a todo doc.', (done)=>{
            request(app)
                .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(dummyTodos[0].text);
                })
                .end(done);
        });

        it('should not return todo doc created by other user.', (done)=>{
            request(app)
                .get(`/todos/${dummyTodos[1]._id.toHexString()}`)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(404)
                .end(done);
        });

        it('should retun 404 if todo is not found.', (done)=>{
            var dummyObjectId = new ObjectId().toHexString();
            request(app)
                .get(`/todos/${dummyObjectId}`)
                .set('x-auth',dummyUsers[0].tokens[0].token)//passing token for authentication 
                .expect(404)
                .end(done);
        });
        it('should return 404 for non-object ids.', (done)=>{
            var nonObjectId = '123';
            request(app)
                .get(`/todos/${nonObjectId}`)
                .set('x-auth',dummyUsers[0].tokens[0].token)//passing token for authentication 
                .expect(404)
                .end(done);
        });
    })

    describe('DELETE /todos/:id', ()=>{
        it('should delete a todo.',(done)=>{
            var todoId = dummyTodos[0]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo._id).to.equal(todoId)
                })
                .end((err,res)=>{
                    if(err){
                        return done(err);
                    }
                    Todos.findById(res.body._id).then((todo)=>{
                        expect(todo).to.be.null;
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                })
        })
        it('should not delete todo created by other user.',(done)=>{
            var todoId = dummyTodos[0]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
                .set('x-auth',dummyUsers[1].tokens[0].token) //passing token for authentication 
                .expect(404)
                .end((err,res)=>{
                    if(err){
                        return done(err);
                    }
                    Todos.findById(todoId).then((todo)=>{
                        expect(todo).to.be.exist;
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                })
        })
        it('should return 404 if todo is not found.', (done)=>{
            var dummyObjectId = new ObjectId().toHexString();
            request(app)
                .delete(`/todos/${dummyObjectId}`)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(404)
                .end(done)
        })

        it('should return 404 for non-objetc Ids.', (done)=>{
            var nonObjectId = 123;
            request(app)
                .delete(`/todos/${nonObjectId}`)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(404)
                .end(done)
        })
    })

    describe("PATCH /todos/:id", ()=>{
        it('should update the todo.',  (done)=>{
            var newTodo = {text: "second todo modify", completed: true}
            request(app)
                .patch(`/todos/${dummyTodos[0]._id}`)
                .send(newTodo)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(newTodo.text);
                    expect(res.body.todo.completed).to.be.true;
                    expect(res.body.todo.completedAt).is.a('number');
                })
                .end(done)
        })

        it('should not update todo created by other user.',  (done)=>{
            var newTodo = {text: "second todo modify", completed: true}
            request(app)
                .patch(`/todos/${dummyTodos[0]._id}`)
                .send(newTodo)
                .set('x-auth',dummyUsers[1].tokens[0].token) //passing token for authentication
                .expect(404)
                .end(done)
        })

        it('should clear completedAt when todo is not completed.', (done)=>{
            var newTodo = {text: "todo is not completed", completed: false}
            request(app)
                .patch(`/todos/${dummyTodos[0]._id}`)
                .send(newTodo)
                .set('x-auth',dummyUsers[0].tokens[0].token) //passing token for authentication
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(newTodo.text);
                    expect(res.body.todo.completed).to.be.false;
                    expect(res.body.todo.completedAt).to.be.null;
                })
                .end(done)
        })

        //we can also test for ObjectId is valid or not for this route
    })

    describe('GET /user/me', ()=>{
        it('should return user if authenticated.',(done)=>{
            request(app)
                .get('/users/me')
                .set('x-auth', dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(200)
                .expect((response)=>{
                    expect(response.body._id).to.be.equal(dummyUsers[0]._id.toHexString());
                    expect(response.body.email).to.be.equal(dummyUsers[0].email)
                })
                .end(done)
        })

        it('should return 401 if not authenticated.', (done)=>{
            request(app)
                .get('/users/me')
                .expect(401)
                .expect((response)=>{
                    expect(response.body).to.be.empty;
                })
                .end(done)
        })
    })

    describe('POST /users', ()=>{
        it('should create new user', (done)=>{
            var email = 'pankaj@mail.com';
            var password = 'panakj123'
            request(app)
                .post('/users')
                .send({email,password})
                .expect(200)
                .expect((response)=>{
                    expect(response.header['x-auth']).to.be.exist;
                    expect(response.body._id).to.be.exist;
                    expect(response.body.email).to.be.equal(email);
                })
                .end((err)=>{
                    if(err){
                        return done(err);
                    }
                    User.findOne({email}).then((user)=>{
                        expect(user.email).to.be.equal(email)
                        expect(user.password).to.be.exist;
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                })
        })
        it('should return validation error if request invalid.',(done)=>{
            request(app)
                .post('/users')
                .send({email: 'invalidEmail',password: '123'})
                .expect(400)
                .end(done)
        })
        it('should not create a user if email is in use.', (done)=>{
            request(app)
                .post('/user')
                .send({
                    email : dummyUsers[0].email,
                    password: 'validPassword'
                })
                .send(400)
                .end(done)
        })
    })

    describe('POST /users/login',()=>{
        it('should return valid user and token',(done)=>{
            request(app)
                .post('/users/login')
                .expect(200)
                .send({email: dummyUsers[1].email, password: dummyUsers[1].password})
                .expect((res)=>{
                    expect(res.header['x-auth']).to.be.exist;
                    expect(res.body.email).to.be.equal(dummyUsers[1].email)
                })
                .end((err,res)=>{
                    if(err){
                        done(err);
                    }
                    User.findById(dummyUsers[1]._id).then((user)=>{
                        expect(user.tokens[1]).to.deep.include({ //becoz user.tokens[0] has a token added already while seeding
                            access: 'auth',
                            token: res.header['x-auth']
                        })
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                });
        })

        it('should reject invalid login', (done)=>{
            request(app)
                .post('/users/login')
                .send({email: dummyUsers[1].email, password: dummyUsers[1].password + 'x'})
                .expect(400)
                .expect((res)=>{
                    expect(res.header['x-auth']).to.be.undefined;
                })
                .end((err,res)=>{
                    //if any token got save on user.tokens
                    if(err){
                        return done(err);
                    }
                    User.findById(dummyUsers[1]).then((user)=>{
                        expect(user.tokens.length).to.be.equal(1); //lenght 1 becoz while seeding user has one token already
                        done();
                    }).catch((err)=>{
                        done(err);
                    })
                })
        })
    })

    describe('DELETE /users/me/token', ()=>{
        it('should remove auth token on logout.', (done)=>{
            request(app)
                .delete('/users/me/token')
                .set('x-auth', dummyUsers[0].tokens[0].token) //passing token for authentication 
                .expect(200)
                .end((err, res)=>{
                    if(err){
                        return done(err);
                    }
                    User.findById(dummyUsers[0]._id).then((user)=>{
                        expect(user.tokens.length).to.be.equal(0);
                        done()
                    }).catch((err)=>{
                        done(err)
                    })
                })
        })
    })
})
