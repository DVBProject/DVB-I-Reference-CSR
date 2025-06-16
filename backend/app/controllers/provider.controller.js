const Provider = require("../models/provider.model.js");
const ServiceList = require("./servicelist.controller");
const User = require("../models/user.model.js");
const { log } = require("../../logging.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a Customer
  const provider = new Provider({
    Kind: req.body.Kind,
    ContactName: req.body.ContactName,
    Jurisdiction: req.body.Jurisdiction,
    Address: req.body.Address,
    ElectronicAddress: req.body.ElectronicAddress,
    Regulator: req.body.Regulator,
    Icons: req.body.Icons,
  });

  const Names = req.body.Names;

  // Save Provider in the database
  Provider.create(provider, Names, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Provider.",
      });
    else {
      if (req.user.Role != "admin") {
        // add the new provider to users' providers
        let updateData = req.user;
        try {
          updateData.Providers.push(data.id);
        } catch(err) {
          log(err);
        }
        User.updateById(req.user.Id, false, new User(updateData), (err, data) => {
          if (err) {
            log(err);
          }
        });
      }

      res.send(data);
    }
  });
};

// Retrieve all Providers from the database.
exports.findAll = async (req, res) => {
  if (req.user && req.user.Role === "admin") {
    Provider.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving providers.",
        });
      else res.send(data);
    });
  } else {
    // fetch all providers for this user
    let provs = req.user.Providers ?? [];

    let result_data = [];
    let promises = [];
    for (const p in provs) {
      promises.push(
        new Promise((resolve, reject) => {
          Provider.findById(provs[p], (err, data) => {
            if (err) {
              reject(err);
              log(err);
            } else {
              result_data.push(data);
              resolve();
            }
          });
        }).catch((err) => {
          log(err);
        })
      );
    }

    await Promise.all(promises).catch((err) => log(err));
    res.send(result_data);

    // TODO: should we remove this id from users proders-set?
  }
};

// Find a single Provider with a id
exports.findOne = (req, res) => {
  let validrequest = true;

  // providerId is a valid number
  const providerId = req.params.customerId;
  if (isNaN(providerId)) {
    validrequest = false;
  }

  // check user has rigths to this prov
  if (req.user.Role !== "admin") {
    let providers = req.user.Providers ?? [];
    if (!providers.includes(+providerId)) {
      validrequest = false;
    }
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  Provider.findById(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.customerId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Customer with id " + req.params.customerId,
        });
      }
    } else res.send(data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  let validrequest = true;

  // providerId is a valid number
  const providerId = req.params.customerId;
  if (isNaN(providerId)) {
    validrequest = false;
  }

  // check user has rigths to this prov
  if (req.user.Role !== "admin") {
    let providers = req.user.Providers ?? [];

    if (!providers.includes(+providerId)) {
      validrequest = false;
    }
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  Provider.updateById(req.params.customerId, new Provider(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Provider with id ${req.params.customerId}.`,
        });
      } else {
        res.status(500).send({
          message: err.message || "Some error occurred while updating the Provider.",
        });
      }
    } else res.send(data);
  });
};

// Delete a Provider with the specified customerId in the request
exports.delete = async (req, res) => {
  // check user has rigths to this prov
  if (req.user.Role != "admin") {
    let providers = req.user.Providers ??[];

    if (!providers.includes(+req.params.customerId)) {
      res.status(400).send({
        message: "Invalid request!",
      });
      return;
    }
  }

  await ServiceList.deleteProviderLists(req, req.params.customerId);

  Provider.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Provider with id ${req.params.customerId}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Provider with id " + req.params.customerId,
        });
      }
    } else res.send({ message: `Provider was deleted successfully!` });
  });
};
