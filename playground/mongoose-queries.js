const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var userId = '5b5de20277eb93611ba6e648';

// var id = '5b5f4fe3818ca05920dc7209';
//
// if(!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log(todos);
// })
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log(todo);
// });

User.findById(userId).then((user) => {
  if(!user) {
    return console.log('User not found');
  }
  console.log('User', user);
}).catch((e) => {
  console.log(e);
});

// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('id not found');
//   }
//   console.log(todo);
// }).catch((e) => {
//   console.log(e);
// })
