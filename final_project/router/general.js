const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered'
  });
});

// Get all books using async/await
public_users.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books' });
  }
});

// Get book by ISBN using a Promise
public_users.get('/isbn/:isbn', (req, res) => {
  Promise.resolve(books[req.params.isbn])
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      return res.status(200).json(book);
    })
    .catch(() => res.status(500).json({ message: 'Error retrieving book' }));
});

// Get books by author using async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = decodeURIComponent(req.params.author).toLowerCase();
    const results = Object.values(books).filter(
      book => book.author.toLowerCase() === author
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books' });
  }
});

// Get books by title using a Promise
public_users.get('/title/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title).toLowerCase();

  Promise.resolve(
    Object.values(books).filter(
      book => book.title.toLowerCase().includes(title)
    )
  )
    .then(results => res.status(200).json(results))
    .catch(() => res.status(500).json({ message: 'Error retrieving books' }));
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
