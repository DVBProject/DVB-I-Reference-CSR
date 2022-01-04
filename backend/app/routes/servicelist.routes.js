module.exports = app => {
    const servicelist = require("../controllers/servicelist.controller.js");
  
    // Create a new service list
    app.post("/servicelist", servicelist.create);
  
    // Retrieve all servicelists
    app.get("/servicelist", servicelist.findAll);
  
    // Retrieve a single list with listId
    app.get("/servicelist/:listId", servicelist.findOne);
  
    // Update a list with listId
    app.put("/servicelist/:listId", servicelist.update);
    
    // Delete a list with listId
    app.delete("/servicelist/:listId", servicelist.delete);
    
    // Retrieve all lists per provider
    app.get("/servicelist/provider/:providerId", servicelist.findAllByProvider);
};