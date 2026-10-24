
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const SECRET = 'fingerprint_customer';

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login registered users
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign({ username }, SECRET);

  return res.status(200).json({
    message: 'User successfully logged in',
    token
  });
});

// Add or update a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review is required' });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added/updated successfully',
    reviews: books[isbn].reviews
  });
});

// Delete a review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.SECRET = SECRET;
