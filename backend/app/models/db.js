const mysql = require("mysql");
const dbConfig = require("../../../db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || dbConfig.HOST,
  user: process.env.DB_USER || dbConfig.USER,
  password: process.env.DB_PASS || dbConfig.PASSWORD,
  database: dbConfig.DB
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;