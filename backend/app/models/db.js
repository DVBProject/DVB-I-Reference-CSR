const mysql = require("mysql2");

// Create a connection to the database
const connection = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTIONS || 10,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  port: process.env.DB_PORT || "",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "dvb_i_csr",
});

// open the MySQL connection
connection.getConnection((error, connection) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
  connection.release();
});

module.exports = connection;
