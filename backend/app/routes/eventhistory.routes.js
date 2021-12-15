module.exports = app => {
    const eventhistory = require("../controllers/eventhistory.controller.js");
  
    // Retrieve all servicelists
    //app.get("/eventhistory", eventhistory.findAll);
  
    // Retrieve a single list events with listId
    app.get("/eventhistory/:listId", eventhistory.findOne);  
  
};