const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// }).catch((e) => {
//   console.log(e);
// })

Todo.findOneAndRemove({_id: '5b63687f39468802a453beac'}).then((result) => {
  console.log(result);
}).catch((e) => {
  console.log(e);
});

Todo.findByIdAndRemove('5b63687f39468802a453beac').then((result) => {
  console.log(result);
}).catch((e) => {
  console.log(e);
})
