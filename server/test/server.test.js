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
                .expect(200)
                .expect((response)=>{
                    expect(JSON.parse(response.text).todos.length).to.equal(3);
                })
                .end(done);
        })
    })

    describe('GET /todos/:id', ()=>{
        it('should return a todo doc.', (done)=>{
            request(app)
                .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(dummyTodos[0].text);
                })
                .end(done);
        });

        it('should retun 404 if todo is not found.', (done)=>{
            var dummyObjectId = new ObjectId().toHexString();
            request(app)
                .get(`/todos/${dummyObjectId}`)
                .expect(404)
                .end(done);
        });
        it('should return 404 for non-object ids.', (done)=>{
            var nonObjectId = '123';
            request(app)
                .get(`/todos/${nonObjectId}`)
                .expect(404)
                .end(done);
        });
    })

    describe('DELETE /todos/:id', ()=>{
        it('should delete a todo.',(done)=>{
            var todoId = dummyTodos[0]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
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

        it('should return 404 if todo is not found.', (done)=>{
            var dummyObjectId = new ObjectId().toHexString();
            request(app)
                .delete(`/todos/${dummyObjectId}`)
                .expect(404)
                .end(done)
        })

        it('should return 404 for non-objetc Ids.', (done)=>{
            var nonObjectId = 123;
            request(app)
                .delete(`/todos/${nonObjectId}`)
                .expect(404)
                .end(done)
        })
    })

    describe("PATCH /todos/:id", ()=>{
        it('should update the todo.',  (done)=>{
            var newTodo = {text: "second todo modify", completed: true}
            request(app)
                .patch(`/todos/${dummyTodos[1]._id}`)
                .send(newTodo)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(newTodo.text);
                    expect(res.body.todo.completed).to.be.true;
                    expect(res.body.todo.completedAt).is.a('number');
                })
                .end(done)
        })

        it('should clear completedAt when todo is not completed.', (done)=>{
            var newTodo = {text: "todo is not completed", completed: false}
            request(app)
                .patch(`/todos/${dummyTodos[0]._id}`)
                .send(newTodo)
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
                .set('x-auth', dummyUsers[0].tokens[0].token)
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
})
