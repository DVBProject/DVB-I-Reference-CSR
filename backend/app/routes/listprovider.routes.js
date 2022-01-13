module.exports = app => {
    const listprovider = require("../controllers/listprovider.controller.js");
  
    // get listprovider
    app.get("/listprovider", listprovider.getProvider);
  
    // Update listProvider
    app.put("/listprovider", listprovider.update);
  
};