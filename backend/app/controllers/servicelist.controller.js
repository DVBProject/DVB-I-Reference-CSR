const ServiceList = require("../models/servicelist.model.js");

// Create and Save a new List
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
  
    // Create a Customer
    const serviceList = new ServiceList({
        Name: req.body.Name,
        URI: req.body.URI,
        lang: req.body.lang,
        Provider: req.body.Provider,
        RegulatorList: req.body.RegulatorList,
        Delivery: req.body.Delivery
    });
  
    // Save Customer in the database
    ServiceList.create(serviceList, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the List."
        });
      else res.send(data);
    });
  };


// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
    ServiceList.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving lists."
        });
      else res.send(data);
    });
  };


