const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', async function (req, res) {
    try {
        const getBooks = async () => {
            return books;
        };

        const allBooks = await getBooks();
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books" });
    }
});

public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params;

    try {
        const getBookByISBN = async (isbn) => {
            return books[isbn];
        };

        const book = await getBookByISBN(isbn);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch book by ISBN" });
    }
});

public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params;

    try {
        const getBooksByAuthor = async (author) => {
            return Object.values(books).filter(book => book.author === author);
        };

        const filteredBooks = await getBooksByAuthor(author);

        if (filteredBooks.length === 0) {
            return res.status(404).json({ message: "No books found by this author" });
        }

        res.status(200).json(filteredBooks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by author" });
    }
});

public_users.get('/title/:title', function (req, res) {
    const { title } = req.params;
    const filteredBooks = Object.values(books).filter(book => book.title === title);

    if (filteredBooks.length === 0) {
        return res.status(404).json({ message: "No books found with this title" });
    }

    res.status(200).json(filteredBooks);
});

public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book.reviews);
});

module.exports.general = public_users;