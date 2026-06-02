const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
} else {
    return res.status(404).json({ message: "Book not found" });
}
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
    
    const bookKeys = Object.keys(books);
    
    // Iterate through the books to find matching titles
    bookKeys.forEach(key => {
        if (books[key].author === author) {
            matchingBooks.push(books[key]);
        }
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title=req.params.title;
  const matchingBooks=[];
  const bookKeys=Object.keys(books);
  bookKeys.forEach(key=>{
    if(books[key].title === title){
       matchingBooks.push(books[key]);
    }
  });
  if(matchingBooks.length>0){
  res.status(200).json({booksbytitle:matchingBooks});
  }
  else{
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
//Task 10: Get the list of books available in the shop using async-await with Axios
const getAllBooks = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log("Task 10 - All Books: ", response.data);
    } catch (error) {
        console.error("Error fetching all books:", error.message);
    }
};

// Task 11: Get book details based on ISBN using async-await with Axios
const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`Task 11 - Book with ISBN ${isbn}: `, response.data);
    } catch (error) {
        console.error("Error fetching book by ISBN:", error.message);
    }
};

// Task 12: Get book details based on Author using async-await with Axios
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Task 12 - Books by ${author}: `, response.data);
    } catch (error) {
        console.error("Error fetching books by author:", error.message);
    }
};

// Task 13: Get book details based on Title using async-await with Axios
const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Task 13 - Books with title '${title}': `, response.data);
    } catch (error) {
        console.error("Error fetching books by title:", error.message);
    }
};
module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
