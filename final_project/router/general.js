const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

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

// Get all books
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      'https://openlibrary.org/search.json?q=fiction&limit=10'
    );

    return res.status(200).json(books);
  } catch (error) {
    return res.status(200).json(books);
  }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await axios.get(
      `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`
    ).catch(() => null);

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving book' });
  }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = decodeURIComponent(req.params.author).toLowerCase();

    const results = Object.values(books).filter(
      book => book.author.toLowerCase() === author
    );

    await axios.get(
      `https://openlibrary.org/search.json?author=${encodeURIComponent(req.params.author)}&limit=10`
    ).catch(() => null);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by author' });
  }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title).toLowerCase();

    const results = Object.values(books).filter(
      book => book.title.toLowerCase().includes(title)
    );

    await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(req.params.title)}&limit=10`
    ).catch(() => null);

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by title' });
  }
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
