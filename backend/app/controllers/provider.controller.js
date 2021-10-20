const Provider = require("../models/provider.model.js");

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

  // Save Customer in the database
  Provider.create(provider, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Customer."
      });
    else res.send(data);
  });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  Provider.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    else res.send(data);
  });
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
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
            message: `Not found Customer with id ${req.params.customerId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Customer with id " + req.params.customerId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  Provider.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.customerId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Customer with id " + req.params.customerId
        });
      }
    } else res.send({ message: `Customer was deleted successfully!` });
  });
};



exports.debugSetup = ( ) => {
  console.log("debugissa, POISTA tää kutsu")
  const sql = require("../models/db.js");



  // "SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator FROM ProviderOffering,Organization where ProviderOffering.Organization = Organization.Id", 
  sql.query("SELECT * FROM ServiceListName", 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
    }
    console.log("res ServiceListName: ", res);
  })

  sql.query("SELECT * FROM ServiceListURI", 
  (err, res) => {
    if (err) {
      console.log("error2: ", err);
    }
    console.log("res ServiceListURI: ", res);
  })

  sql.query("SELECT * FROM ServiceListOffering", 
  (err, res) => {
    if (err) {
      console.log("error5: ", err);
    }
    console.log("res ServiceListOffering: ", res);
  })

  // kikkailu, kun sql-setuppi ei osannut luoda ekaa ServiceListRegistryEntityä
  sql.query("SELECT * FROM ServiceListEntryPoints", 
  (err, res) => {
    if (err) {
      console.log("error3: ", err);
    }
    console.log("res ServiceListEntryPoints: ", res);
    if(res.length == 0) {
      console.log("create")
      const newServiceEntryPoint = {
        ServiceListRegistryEntity: 1
      }

      sql.query("INSERT INTO ServiceListEntryPoints SET ?", newServiceEntryPoint, (err, res) => {
        if (err) {
          console.log("error4: ", err);
        }
        else {
          console.log("created:", res)
        }
      }) 
    }
  })



}