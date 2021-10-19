module.exports = app => {
    const servicelist = require("../controllers/servicelist.controller.js");
  
    // Create a new service list
    app.post("/servicelist", servicelist.create);
  
    // Retrieve all servicelists
    app.get("/servicelist", servicelist.findAll);
  /*
    // Retrieve a single Customer with customerId
    app.get("/servicelist/:customerId", servicelist.findOne);
  
    // Update a Customer with customerId
    app.put("/servicelist/:customerId", servicelist.update);
  
    // Delete a Customer with customerId
    app.delete("/servicelist/:customerId", servicelist.delete);
    */
  
};