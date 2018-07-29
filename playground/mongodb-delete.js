const { MongoClient, ObjectID } = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to mongodb server');
  }
  console.log('Connected to mongodb server');

  //delete many
  // db.collection('Users').deleteMany({name: 'Anirudh'}).then((result) => {
  //   console.log(result);
  // });

  //delete one
  // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  //findOne and delete
  db.collection('Users').findOneAndDelete({ _id: new ObjectID('5b5cbd205f816817d5019b51')}).then((result) => {
    console.log(result);
  });

  // // db.close();
});
