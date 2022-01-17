const Provider = require("../models/provider.model.js");
const ServiceList = require("./servicelist.controller")

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Customer
  const provider = new Provider({
    Kind: req.body.Kind,
    ContactName: req.body.ContactName,
    Jurisdiction: req.body.Jurisdiction,
    Address: req.body.Address,
    ElectronicAddress: req.body.ElectronicAddress,
    Regulator: req.body.Regulator    
  });

  const Names = req.body.Names

  // Save Provider in the database
  Provider.create(provider, Names, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Provider."
      });
    else res.send(data);

    // add the new provider to users' providers
    // 
  });
};

// Retrieve all Providers from the database.
exports.findAll = (req, res) => {
  if (req.user && req.user.Role == "admin") {
    Provider.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving providers."
        });
      else res.send(data);
    });
  }
  else {
    res.status(500).send({
      message:
        err.message || "Not authorized."
    })
  }
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
  // check user has rigths to this prov

  Provider.findById(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.customerId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Customer with id " + req.params.customerId
        });
      }
    } else res.send(data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // check user has rigths to this prov

  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Provider.updateById(
    req.params.customerId,
    new Provider(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Provider with id ${req.params.customerId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Provider with id " + req.params.customerId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Provider with the specified customerId in the request
exports.delete = async (req, res) => {
  // check user has rigths to this prov
  //console.log(req.params, req.body)
  await ServiceList.deleteProviderLists(req, req.params.customerId)

  Provider.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Provider with id ${req.params.customerId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Provider with id " + req.params.customerId
        });
      }
    } else res.send({ message: `Provider was deleted successfully!` });
  });
};




