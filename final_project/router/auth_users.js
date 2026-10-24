
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const SECRET = 'fingerprint_customer';

// Check whether user is registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username &&
            user.password === password
  );
};

// Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign(
    { username },
    SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'User successfully logged in',
    token: token
  });
});

// Add or update a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const username = req.user.username;
  const { review } = req.body;

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Review is required'
    });
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: book.reviews
  });
});

// Delete your review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const username = req.user.username;

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({
      message: 'Review not found'
    });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted`,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.SECRET = SECRET;

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const username = req.user.username;

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({
      message: 'Review not found for this user'
    });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted`,
    reviews: book.reviews
  });
});
