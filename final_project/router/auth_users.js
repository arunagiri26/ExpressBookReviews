const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, 'secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    
    const token = jwt.sign({ username }, 'secret_key');
    res.status(200).json({ message: "Login successful", token });
});

regd_users.delete("/auth/review/:isbn", authenticate, (req, res) => {
    const isbn = String(req.params.isbn);
    const { username } = req.user;

    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete book.reviews[username];
    res.status(200).json({ message: "Review deleted successfully" });
});


regd_users.put("/auth/review/:isbn", authenticate, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const { username } = req.user; 

    const bookIsbn = String(isbn); 
    
    let book = books[isbn];  
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    book.reviews[username] = review;
    res.status(200).json({ message: "Review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;