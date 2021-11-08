// catch all rogue exceptions
process.on('uncaughtException', err => {
	console.log('Caught exception: ', err);
});

require("dotenv").config()
const express = require("express");

const app = express();
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors())
// parse requests of content-type: application/json
app.use(express.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "DVB-I CSR backend" });
});



// auth

// service routes
require("./app/routes/provider.routes")(app);
require("./app/routes/servicelist.routes")(app);

// set port, listen for requests
app.listen(3000, () => {
  console.log("Backend server is running on port 3000.");
});

