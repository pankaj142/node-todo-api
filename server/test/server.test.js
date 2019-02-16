const request = require('supertest');
const should = require('chai').should();
const expect = require('chai').expect;
const {app} = require('../server');
const Todos = require('../models/todos');

const todos = [{
    text: "First Todo"
},{
    text: "second Todo"
}]
beforeEach((done)=>{
    Todos.deleteMany({}).then(()=>{
        Todos.insertMany(todos).then(()=>done())
    });
})

// afterEach((done)=>{
//     Todos.deleteMany({}).then(()=>done());
// })

describe('----------- TESTING ROUTES -------------', ()=>{
    describe('POST /todos', ()=>{
        it('should create a new todo.', (done)=>{
            let testingText = "xxxxx";
            request(app)
               .post('/todos')
               .send({text : testingText})
               .expect(200)
               .expect((res)=>{
                   //assertion for response body
                    expect(res.body.text).to.have.lengthOf.above(3, "text length cannot be less 3"); 
                    res.body.text.should.equal(testingText);
               })
               .end((err,res)=>{
                   if(err){
                       return done(err);
                   }
                   //assertion about wheather expected data(todo) is saved on collection(todos) or not
                   //assumption- no todo is present on todos collection prior to this test as we remove all todos in beforeEach function                  
                   Todos.find().then((todos)=>{
                       expect(todos.length).to.equal(3);
                       expect(todos[2].text).to.equal(testingText);
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
                        expect(todos.length).to.equal(2);
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
                    expect(response.todos.length).to.equal(2);
                })
                .end(done());
        })
    })
    
})
