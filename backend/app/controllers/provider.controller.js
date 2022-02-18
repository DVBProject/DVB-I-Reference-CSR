const Provider = require("../models/provider.model.js");
const ServiceList = require("./servicelist.controller")
const User = require("../models/user.model.js");

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
    else {
      
      if(req.user.Role != "admin") {
        // add the new provider to users' providers
        //
        let updateData = req.user
        try {
          updateData.Providers = JSON.parse(updateData.Providers)
          updateData.Providers.push(data.id)
          updateData.Providers = JSON.stringify(updateData.Providers)
        } catch {
          console.log("user data or new provider id corrupted", req.user)
        }
        User.updateById(
          req.user.Id,
          false,
          new User(updateData),
          (err, data) => {
            if (err) {         
              console.log("error adding provider to user", req.user.Id)        
            } 
            else {
              console.log("added new provider to user", req.user.Id)   
            }
        })
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
          message:
            err.message || "Some error occurred while retrieving providers."
        });
      else res.send(data);
    });
  }
  else {
    // fetch all providers for this user
    //let provs = JSON.parse(req.user.Providers)
    let provs = []
    try {
      provs = JSON.parse(req.user.Providers)
    } catch {
      console.log("user data corrupt", req.user)
    }

    let result_data = []
    let promises = []
    let failedProviderIds = []
    for( p in provs ) {
      promises.push(new Promise(async (resolve, reject) => {
        Provider.findById(provs[p], (err, data) => {
          if (err) {
            reject(err)
            console.log("error getting provider", provs[p])
            failedProviderIds.push(provs[p])
          }
          else {        
            result_data.push(data)  
            resolve()
          }
        })
      }).catch(err => {
        console.log("get users providers error:", err)
      }))      
    }

    await Promise.all(promises).catch(err => console.log("ALL", err))
    res.send(result_data)

    // TODO: should we remove this id from users proders-set?
    // failedProviderIds
  }
};

// Find a single Provider with a id
exports.findOne = (req, res) => {
  
  let validrequest = true

  // providerId is a valid number
  const providerId = req.params.customerId
  if (isNaN(providerId)) {
    validrequest = false
  }

  // check user has rigths to this prov
  if (req.user.Role !== 'admin') {
    //const providers = JSON.parse(req.user.Providers)
    let providers = []
    try {
      providers = JSON.parse(req.user.Providers)
    } catch {
      console.log("user data corrupt", req.user)
    }
    
    if (!providers.includes(+providerId)) {
        validrequest = false
    }
  }

  if(!validrequest) {
    res.status(400).send({
      message: "Invalid request!"
    })
    return
  }

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

  let validrequest = true

  // providerId is a valid number
  const providerId = req.params.customerId
  if (isNaN(providerId)) {
    validrequest = false
  }

  // check user has rigths to this prov
  if (req.user.Role !== 'admin') {
    //const providers = JSON.parse(req.user.Providers)
    let providers = []
    try {
      providers = JSON.parse(req.user.Providers)
    } catch {
      console.log("user data corrupt", req.user)
    }
    
    if (!providers.includes(+providerId)) {
        validrequest = false
    }
  }

  if(!validrequest) {
    res.status(400).send({
      message: "Invalid request!"
    })
    return
  }
  

  console.log("updating:", req.body);

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




