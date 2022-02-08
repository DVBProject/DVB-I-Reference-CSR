module.exports = app => {
    const user = require("../controllers/user.controller.js");
  
    // Retrieve all users
    app.get("/users", user.findAll);

    // Retrieve a single user
    app.get("/users/:userId", user.findOne);

    // Create a new user
    app.post("/users", user.create);
  
    // Update a user with userId
    app.put("/users/:userId", user.update);
    
    // Delete a user with userId
    app.delete("/users/:userId", user.delete);

    // log out a users token
    app.get("/logout", user.logout);  
    
    // change password
    app.post("/pwd", user.changePassword)
};