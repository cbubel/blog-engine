var express = require('express');
var router = express.Router();
var Firebase = require('firebase');

var myDB = new Firebase('https://blog-engine.firebaseio.com/');

// Get home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Blog Engine' });
});

// Returns all posts
router.get('/posts', function(req, res, next) {
  myDB.child("posts").once("value", function(snapshot) {
    res.status(200).send(snapshot.val());
  });
});

// Takes title and contents in req.body
// Creates a post in Firebase with timestamp and random id
router.post('/post', function(req, res, next) {
  var title = req.body.title;
  var contents = req.body.contents;
  var timestamp = Firebase.ServerValue.TIMESTAMP
  var new_post = {
    title: title,
    contents: contents,
    timestamp: timestamp
  };

  var post_ref = myDB.child('posts').push(new_post);

  res.status(200).end();
});

router.post('/comment', function(req, res, next) {
  var name = req.body.name;
  var comment = req.body.comment;
  var post_id = req.body.post_id;
  var timestamp = Firebase.ServerValue.TIMESTAMP

  var full_comment = {
    name: name,
    comment: comment,
    timestamp: timestamp
  };

  var post_ref = myDB.child('posts/' + post_id + "/comments").push(full_comment);

  myDB.child("posts/" + post_id + "/comments").once("value", function(snapshot) {
    res.status(200).send(snapshot.val());
  });
});

module.exports = router;
