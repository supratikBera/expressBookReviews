const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// ==========================================
// ROUTE: Register a new user
// ==========================================
public_users.post("/register", (req,res) => {
  // 1. Extract the username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // 2. Check if both fields were provided by the user
  if (username && password) {
    // 3. Use the isValid helper to check if this username is already taken
    if (!isValid(username)) { 
      // 4. If not taken, add the new user to our mock database (the users array)
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      // 5. If taken, send a 409 Conflict error
      return res.status(409).json({message: "User already exists!"});
    }
  }
  // 6. If username or password was missing, send a 400 Bad Request error
  return res.status(400).json({message: "Unable to register user. Please provide username and password."});
});


// ==========================================
// ROUTE: Get all books
// ==========================================
public_users.get('/',function (req, res) {
  // 1. Stringify the books object and add 4 spaces of indentation for readability
  // 2. Send it back to the client with a 200 OK status
  return res.status(200).send(JSON.stringify({books}, null, 4));
});


// ==========================================
// ROUTE: Get book by ISBN
// ==========================================
public_users.get('/isbn/:isbn',function (req, res) {
  // 1. Extract the ISBN number from the URL parameters
  const isbn = req.params.isbn;
  // 2. Look up that exact key in our books dictionary
  const book = books[isbn];
  
  // 3. If a book with that ISBN exists, return its details
  if (book) {
    return res.status(200).json(book);
  } else {
    // 4. If not, return a 404 Not Found error
    return res.status(404).json({ message: "Book not found" });
  }
});

  
// ==========================================
// ROUTE: Get books by Author
// ==========================================
public_users.get('/author/:author',function (req, res) {
    // 1. Extract the author's name from the URL parameters
    const author = req.params.author;
    // 2. Create an empty array to store any books we find by this author
    const matchingBooks = [];
    
    // 3. Get all the keys (ISBNs) from the books object
    const bookKeys = Object.keys(books);
    
    // 4. Loop through every single book in the database
    bookKeys.forEach(key => {
        // 5. If the current book's author matches the one we are searching for, save it
        if (books[key].author === author) {
            matchingBooks.push(books[key]);
        }
    });

    // 6. If we found at least one book, return the array
    if (matchingBooks.length > 0) {
        return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
        // 7. If the array is still empty, return a 404 error
        return res.status(404).json({ message: "No books found by this author" });
    }
});


// ==========================================
// ROUTE: Get books by Title
// ==========================================
public_users.get('/title/:title',function (req, res) {
  // 1. Extract the title from the URL parameters
  const title = req.params.title;
  // 2. Create an empty array to hold matches
  const matchingBooks = [];
  // 3. Get all the keys (ISBNs) from the books object
  const bookKeys = Object.keys(books);
  
  // 4. Loop through the database to find exact title matches
  bookKeys.forEach(key=>{
    if(books[key].title === title){
       matchingBooks.push(books[key]);
    }
  });
  
  // 5. If matches were found, return them
  if(matchingBooks.length > 0){
    return res.status(200).json({booksbytitle: matchingBooks});
  } else {
    // 6. Otherwise, return a 404 error
    return res.status(404).json({ message: "No books found with this title" });
  }
});


// ==========================================
// ROUTE: Get book review
// ==========================================
public_users.get('/review/:isbn',function (req, res) {
    // 1. Extract the ISBN from the URL parameters
    const isbn = req.params.isbn;
    // 2. Look up the specific book in the database
    const book = books[isbn];

    // 3. If the book exists, send back ONLY the 'reviews' property of that book
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        // 4. If the book doesn't exist, return a 404 error
        return res.status(404).json({ message: "Book not found" });
    }
});


// ==========================================
// PROMISE / ASYNC TASKS WITH AXIOS
// ==========================================

// Task 10: Get all books using async-await
const getAllBooks = async () => {
    try {
        // Send a GET request to our own local server's root endpoint
        const response = await axios.get('http://localhost:5000/');
        console.log("Task 10 - All Books: ", response.data);
    } catch (error) {
        console.error("Error fetching all books:", error.message);
    }
};

// Task 11: Get book by ISBN using async-await
const getBookByISBN = async (isbn) => {
    try {
        // Send a GET request, dynamically injecting the ISBN into the URL
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`Task 11 - Book with ISBN ${isbn}: `, response.data);
    } catch (error) {
        console.error("Error fetching book by ISBN:", error.message);
    }
};

// Task 12: Get book by Author using async-await
const getBooksByAuthor = async (author) => {
    try {
        // Send a GET request, dynamically injecting the author name into the URL
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Task 12 - Books by ${author}: `, response.data);
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
    }
};

// Task 13: Get book by Title using async-await
const getBooksByTitle = async (title) => {
    try {
        // Send a GET request, dynamically injecting the title into the URL
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Task 13 - Books with title '${title}': `, response.data);
    } catch (error) {
        console.error("Error fetching books by title:", error.message);
    }
};

// Export the router and the axios functions so index.js can use them
module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;