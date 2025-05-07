require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database connection using the path from the .env file
const dbPath = path.resolve(__dirname, process.env.DATABASE_PATH);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

module.exports = db;