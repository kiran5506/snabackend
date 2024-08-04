const dotenv = require("dotenv").config();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const isTokenBlacklisted = (token, callback) => {
    const sql = 'SELECT * FROM token_blacklist WHERE token = ?';
    db.query(sql, [token], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results.length > 0);
    });
};

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];    
    if (token) {
        isTokenBlacklisted(token, (err, blacklisted) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            if (blacklisted) return res.status(403).json({ message: 'Token is blacklisted' });
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) return res.status(403).json({ message: 'Forbidden' });
                req.user = user;
                next();
            });
        })        
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
};

module.exports = authenticateJWT;