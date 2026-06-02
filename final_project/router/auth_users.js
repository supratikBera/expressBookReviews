const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper: Checks if a username already exists
const isValid = (username) => {
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length > 0;
}

// Helper: Verifies if the username and password match a registered user
const authenticatedUser = (username, password) => { 
    let validUsers = users.filter((user) => user.username === username && user.password === password);
    return validUsers.length > 0;
}

// Login Route: Only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in: Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Create the JWT token
        const accessToken = jwt.sign({ username: username }, "access", { expiresIn: 60 * 60 });
        
        // Save the token and username into the session container
        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ message: "User logged in successfully" });
    } else {
        return res.status(401).json({ message: "Error logging in: Invalid username or password" });
    }   
});

// Add or Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // The review text is typically sent as a query parameter (e.g., ?review=great book)
    const reviewText = req.query.review; 
    
    // Extract the username of the currently logged-in user from the session
    const username = req.session.authorization['username'];

    // 1. Check if the user provided a review
    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required in the query parameters" });
    }

    // 2. Check if the book exists in our database
    if (books[isbn]) {
        // 3. Add or update the review. 
        // We use the username as the key so each user only has one review per book.
        books[isbn].reviews[username] = reviewText;
        
        return res.status(200).json({ 
            message: `Review successfully posted for book ISBN ${isbn}`,
            reviews: books[isbn].reviews 
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Extract the username of the currently logged-in user from the session
    const username = req.session.authorization['username'];

    // 1. Check if the book exists
    if (books[isbn]) {
        // 2. Check if this specific user has a review for this book
        if (books[isbn].reviews[username]) {
            // 3. Delete the user's review
            delete books[isbn].reviews[username];
            
            return res.status(200).json({ 
                message: `Review successfully deleted for book ISBN ${isbn}`,
                reviews: books[isbn].reviews 
            });
        } else {
            return res.status(404).json({ message: "You have not reviewed this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;