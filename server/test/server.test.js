//NOTE- use mocha 3.0.2 for avoiding some errors
const request = require('supertest');
const should = require('chai').should();
const expect = require('chai').expect;
const {app} = require('../server');
const {Todos} = require('../models/todos');
const {ObjectId} = require('mongodb');

const todos = [{
    _id : new ObjectId(),
    text : "First Todo"
},{
    _id : new ObjectId(),
    text : "second Todo"
},
{
    _id : new ObjectId(),
    text : "Third Todo"
}]

// afterEach((done)=>{
//     Todos.deleteMany({}).then(()=>done());
// })


describe('----------- TESTING ROUTES -------------', ()=>{
    beforeEach((done)=>{
        Todos.deleteMany({})
            .then(()=>{
                // console.log('deleted');
                return Todos.insertMany(todos);
            })
            .then(()=>{
                // console.log('inserted');
                done()
            })
            .catch((err)=>{
                done(err)
            })
    })

    describe('POST /todos', ()=>{
        it('should create a new todo.', (done)=>{
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
                   //assumption- no todo is present on todos collection prior to this test as we remove all todos in beforeEach function                  
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
                    expect(response.todos.length).to.equal(3);
                })
                .end(done());
        })
    })

    describe('GET /todos/:id', ()=>{
        it('should return a todo doc.', (done)=>{
            request(app)
                .get(`/todos/${todos[0]._id.toHexString()}`)
                .expect(200)
                .expect((res)=>{
                    expect(res.body.todo.text).to.equal(todos[0].text);
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
            var todoId = todos[0]._id.toHexString();
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
})
