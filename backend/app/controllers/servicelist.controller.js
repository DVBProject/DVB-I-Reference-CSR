const ServiceList = require("../models/servicelist.model.js");

// Create and Save a new List
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
  
    // Create a List
    const serviceList = new ServiceList({
        Name: req.body.Name,
        URI: req.body.URI,
        lang: req.body.lang,
        Provider: req.body.Provider,
        regulatorList: req.body.regulatorList,
        Delivery: req.body.Delivery
    });
  
    // Save List in the database
    ServiceList.create(serviceList, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the List."
        });
      else res.send(data);
    });
  };


// Retrieve all Lists from the database.
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


// Find a single List with a listId
exports.findOne = (req, res) => {
  ServiceList.findById(req.params.listId, (err, data) => {
    if (err) {
      if (err.Name === "not_found") {
        res.status(404).send({
          message: `Not found List with id ${req.params.listId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving List with id " + req.params.listId
        });
      }
    } else res.send(data);
  });
};

// update

// delete


