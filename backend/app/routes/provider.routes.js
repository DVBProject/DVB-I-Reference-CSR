module.exports = app => {
    const providers = require("../controllers/provider.controller.js");
  
    // Create a new Customer
    app.post("/providers", providers.create);
  
    // Retrieve all providers
    app.get("/providers", providers.findAll);
  
    // Retrieve a single Customer with customerId
    app.get("/providers/:customerId", providers.findOne);
  
    // Update a Customer with customerId
    app.put("/providers/:customerId", providers.update);
  
    // Delete a Customer with customerId
    app.delete("/providers/:customerId", providers.delete);

    
    providers.debugSetup()
  
};