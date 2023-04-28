const Listprovider = require("../models/listprovider.model.js");

// Retrieve all Providers from the database.
exports.getProvider = (req, res) => {
  Listprovider.getProvider((err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occurred while getting listprovider.",
      });
    } else res.send(data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  console.log(req.body);

  Listprovider.update(new Listprovider(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `List provider not found`,
        });
      } else {
        console.log(err);
        if (err.message) {
          res.status(500).send({
            message: "Error: " + err.message,
          });
        } else {
          res.status(500).send({
            message: "Error updating listprovider",
          });
        }
      }
    } else res.send(data);
  });
};
