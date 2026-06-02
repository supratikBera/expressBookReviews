const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// =========================================================================
// 1. REGISTER USER (Robust validations added)
// =========================================================================
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check for missing fields or empty spaces
  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.status(400).json({ message: "Username and password are required fields." });
  }

  const cleanUsername = username.trim();

  // isValid returns true if the username already exists in the database
  if (isValid(cleanUsername)) {
    return res.status(409).json({ message: "Username already exists. Please choose another one." });
  }

  // Register the clean user credentials
  users.push({ "username": cleanUsername, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// =========================================================================
// 2. GET ALL BOOKS 
// =========================================================================
public_users.get('/', function (req, res) {
  // Always returns standard clean JSON object formatted with 4 spaces
  return res.status(200).send(JSON.stringify({ books }, null, 4));
});

// =========================================================================
// 3. GET BOOK BY ISBN
// =========================================================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (!isbn) {
    return res.status(400).json({ message: "ISBN parameter is missing." });
  }

  const book = books[isbn.trim()];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});
  
// =========================================================================
// 4. GET BOOKS BY AUTHOR (Case-insensitive & space-trimmed fallback added)
// =========================================================================
public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author;
  
  if (!authorParam) {
    return res.status(400).json({ message: "Author parameter is missing." });
  }

  const cleanAuthor = authorParam.trim().toLowerCase();
  const matchingBooks = [];
  const bookKeys = Object.keys(books);
  
  bookKeys.forEach(key => {
    const currentBookAuthor = books[key].author;
    if (currentBookAuthor) {
      // Robust Check: Handles direct matches, case-insensitive matches, and trailing spaces
      if (currentBookAuthor === authorParam || currentBookAuthor.trim().toLowerCase() === cleanAuthor) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbyauthor: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// =========================================================================
// 5. GET BOOKS BY TITLE (Case-insensitive & space-trimmed fallback added)
// =========================================================================
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title;

  if (!titleParam) {
    return res.status(400).json({ message: "Title parameter is missing." });
  }

  const cleanTitle = titleParam.trim().toLowerCase();
  const matchingBooks = [];
  const bookKeys = Object.keys(books);
  
  bookKeys.forEach(key => {
    const currentBookTitle = books[key].title;
    if (currentBookTitle) {
      // Robust Check: Handles exact matches and case-insensitive matches cleanly
      if (currentBookTitle === titleParam || currentBookTitle.trim().toLowerCase() === cleanTitle) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
  });
  
  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbytitle: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// =========================================================================
// 6. GET BOOK REVIEWS
// =========================================================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (!isbn) {
    return res.status(400).json({ message: "ISBN parameter is missing." });
  }

  const book = books[isbn.trim()];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// =========================================================================
// ASYNC-AWAIT / AXIOS CALLS (All corrected to live Port 5000)
// =========================================================================

// Task 10: Get all books using async-await
const getAllBooks = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log("Task 10 - All Books Retrieved Successfully via Axios!");
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
};

// Task 11: Get book details based on ISBN using async-await
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log(`Task 11 - Book with ISBN ${isbn} Retrieved Successfully via Axios!`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book by ISBN (${isbn}):`, error.message);
  }
};

// Task 12: Get book details based on Author using async-await
const getBooksByAuthor = async (author) => {
  try {
    const encodedAuthor = encodeURIComponent(author);
    const response = await axios.get(`http://localhost:5000/author/${encodedAuthor}`);
    console.log(`Task 12 - Books by Author "${author}" Retrieved Successfully via Axios!`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author (${author}):`, error.message);
  }
};

// Task 13: Get book details based on Title using async-await
const getBooksByTitle = async (title) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await axios.get(`http://localhost:5000/title/${encodedTitle}`);
    console.log(`Task 13 - Books with Title "${title}" Retrieved Successfully via Axios!`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title (${title}):`, error.message);
  }
};

// Exporting routers and async methods cleanly
module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;