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

const PORT = process.env.PORT || 3000;
app.use(cors())

app.disable('x-powered-by')
if(!process.env.JWT_SECRET) {
  console.log("WARNING! JWT_SECRET NOT DEFINED! PLEASE DEFINE YOUR JWT SECRET IN THE ENV-FILE!")
}
app.set("jwtstring", process.env.JWT_SECRET || "7öldÖJISjfs903jF(NljewOIWJRÖOA30SF") 


// parse requests of content-type: application/json
app.use(express.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "DVB-I CSR backend" });
});

// public routes
require("./app/routes/public")(app)

// auth
app.use(require("./middleware/authentication"))

// service routes
require("./app/routes/provider.routes")(app);
require("./app/routes/servicelist.routes")(app);
require("./app/routes/eventhistory.routes")(app);
require("./app/routes/listprovider.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
app.listen(PORT, () => {
  console.log("Backend server is running on port "+PORT);
});
