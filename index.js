// node dependencies
const express = require('express');
const server = express();
const helmet = require('helmet');
const cors = require('cors');
const logger = require('morgan');

// database
const userDb = require('./data/helpers/userDb');
const postDb = require('./data/helpers/postDb');

// middleware
server.use(logger('tiny'), helmet(), cors());
server.use(express.json());

// custom middleware user's name is Uppercased
const upperCase = (req, res, next) => {
  req.body.name = req.body.name.toUpperCase();
  next();
};

server.get('/', (req, res) => {
  res.send('Welcome!');
});

server.get('/api/users', (req, res) => {
  userDb.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ error: "The users information could not be retrieved.", err });
    })
});

server.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  userDb.get(userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ message: "The user with the specified ID does not exist." });
      }
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ error: "The user information could not be retrieved.", err });
    })
});

server.post('/api/users', upperCase, (req, res) => {
  const { name } = req.body;
  const newUser = { name };
  userDb
    .insert(newUser)
    .then(userId => {
      const { id } = userId;
      userDb.get(id)
        .then(user => {
          if (!user) {
            res.status(400).json({ errorMessage: "Please provide name for the user." });
          }
          res.status(201).json(user);
        });
    })
    .catch(err => {
      res.status(500).json({ error: "There was an error while saving the user to the database", err });
    })
});

server.delete('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(404).json({ message: "The user with the specified ID does not exist." });
  }
  userDb.remove(userId)
    .then(removedUser => {
      res.status(200).json({ message: "The user was deleted"});
    })
    .catch(err => {
      res.status(500).json({ error: "The user could not be removed", err });
    })
});

server.put('/api/users/:userId', upperCase, (req, res) => {
  const userId = req.params.userId;
  const { name } = req.body;
  const newUser = { name };
  if (!userId) {
    res.status(404).json({ message: "The user with the specified ID does not exist." });
  }
  else if (!name) {
    res.status(400).json({ errorMessage: "Please provide name for the user." });
  }
  userDb.update(userId, newUser)
    .then(user => {
      res.status(200).json({ message: "The user has been updated"});
    })
    .catch(err => {
      res.status(500).json({ error: "The user information could not be modified.", err });
    });
});



server.get('/api/posts', (req, res) => {
  postDb.get()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json({ error: "The posts information could not be retrieved.", err });
    })
});

server.get('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId;
  postDb.get(postId)
    .then(post => {
      if (!post) {
        res.status(404).json({ message: "The post with the specified ID does not exist." });
      }
      res.status(200).json(post);
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be retrieved.", err });
    })
});

server.post('/api/posts', (req, res) => {
  const { text, userId } = req.body;
  const newPost = { text, userId };
  postDb
    .insert(newPost)
    .then(postId => {
      const { id } = postId;
      postDb.get(id)
        .then(post => {
          if (!post) {
            res.status(400).json({ errorMessage: "Please provide text and userId for the post." });
          }
          res.status(201).json(post);
        });
    })
    .catch(err => {
      res.status(500).json({ error: "There was an error while saving the post to the database", err });
    })
});

server.delete('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId;
  if (!postId) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  }
  postDb.remove(postId)
    .then(removedPost => {
      res.status(200).json({ message: "The post was deleted"});
    })
    .catch(err => {
      res.status(500).json({ error: "The post could not be removed", err });
    })
});

server.put('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId;
  const { text, userId } = req.body;
  const newPost = { text, userId };
  if (!postId) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  }
  else if (!newPost) {
    res.status(400).json({ errorMessage: "Please provide text and userId for the post." });
  }
  postDb.update(postId, newPost)
    .then(post => {
      res.status(200).json({ message: "The post has updated"});
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be modified.", err });
    });
});


const port = 5000;
server.listen(port, () =>
  console.log(`\n=== API running on port ${port} ===\n`)
);