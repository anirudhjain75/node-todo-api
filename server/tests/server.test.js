const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {User} = require('./../models/user.js');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => {
          done(e);
        })
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.text).toBe(undefined);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e)=> {
          done(e);
        });
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non object id', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBe(null);
          done();
        }).catch((e) => done(e))
      });
  });

  it('should not remove a todo if not created by self', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).not.toBe(null);
          done();
        }).catch((e) => done(e))
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete(`/todos/1234`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var id = todos[0]._id;

    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text: 'this is the first todo',
        completed: true
      })
      .expect(200)
      .expect((res) => {
        var todo = res.body.todo;

        expect(todo.text).toBe('this is the first todo');
        expect(todo.completed).toBe(true);
      })
      .end(done);
  });

  it('should not update todo if not authorized correctly', (done) => {
    var id = todos[1]._id;

    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text: 'this is the first todo',
        completed: true
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id;

    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text: 'this is the second todo',
        completed: false
      })
      .expect(200)
      .expect((res) => {
        var todo = res.body.todo;

        expect(todo.text).toBe('this is the second todo');
        expect(todo.completed).toBe(false);
        expect(todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user when authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = 'helloworld';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeDefined();
        expect(res.body._id).toBeDefined();
        expect(res.body.email).toBe(email);
      })
      .end((error) => {
        if(error) {
          return done(error);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeDefined();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation error if request is invalid', (done) => {
    var email = 'anirudh';
    var password = '1234';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.body._id).toBeUndefined();
        expect(res.body.email).toBeUndefined();
      })
      .end(done)
  });

  it('should not create user if email in use', (done) => {
    var email = 'test@test.com';
    var password = '12345678';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.body._id).toBeUndefined();
        expect(res.body.email).toBeUndefined();
      })
      .end(done)
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBe(undefined);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toHaveProperty('access', 'auth');
          expect(user.tokens[1]).toHaveProperty('token', res.headers['x-auth']);
          // expect(user.tokens[0]).toInclude({
          //   access: 'auth',
          //   token: res.headers['x-auth']
          // });
          done();
        }).catch((e) => {
          done(e);
        })
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'meowman123'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeUndefined();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens).toHaveLength(0);
          done()
        }).catch((e) => done(e));
      });
  });
});
