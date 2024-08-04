// db.js
const mysql = require('mysql2');
const dotenv = require("dotenv").config();

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER, // replace with your MySQL username
    password: process.env.MYSQL_PASSWORD, // replace with your MySQL password
    database: process.env.MYSQL_DATABASE
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = connection;
