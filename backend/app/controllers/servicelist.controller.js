const ServiceList = require("../models/servicelist.model.js");
const EventHistory = require("../controllers/eventhistory.controller");
const Providers = require("../controllers/provider.controller");
const { log } = require("../../logging.js");

// Create and Save a new List
exports.create = (req, res) => {
  // better validation, TODO

  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // provider check, user must "own" the provider to add a new list
  let  provs = req.user.Providers ?? [];
  if (!provs.includes(req.body.ProviderId) && req.user.Role !== "admin") {
    res.status(400).send({
      message: "Invalid request",
    });
    return;
  }

  // Create a List
  const serviceList = new ServiceList({
    Names: req.body.Names,
    URI: req.body.URI,
    languages: req.body.languages,
    Provider: req.body.Provider,
    ProviderId: req.body.ProviderId,
    regulatorList: req.body.regulatorList,
    Delivery: req.body.Delivery,
    targetCountries: req.body.targetCountries,
    Genres: req.body.Genres,
    Status: "active",
    ServiceListId: req.body.ServiceListId
  });

  // Save List in the database
  ServiceList.create(serviceList, (err, data) => {
    if (err)
      res.status(500).send({
        message: "Error creating List" + (err.msg ? ": " + err.msg : ""),
      });
    else {
      res.send(data);

      // Log an event for this serviceList's event history
      const event = {
        ...data,
        Name: req.body.Names[0].name,
        user: req.user,
        eventType: "Create",
        //ContentJson: ""   // this field for actual update contents, possible undo feature
      };

      EventHistory.create(event, (err, res) => {
        if (err) {
          log(err);
        }
      });
    }
  });
};

// Retrieve all Lists from the database.
exports.findAll = async (req, res) => {
  // check that user is admin
  if (!req.user) {
    res.status(500).send({
      message: "Not authorized.",
    });
    return;
  }

  if (req.user.Role == "admin") {
    ServiceList.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving lists.",
        });
      else res.send(data);
    });
  } else {
    // get users providers and their lists
    let provs = req.user.Providers ?? [];
    let lists = [];
    let promises = [];
    for (const p in provs) {
      promises.push(
        new Promise((resolve, reject) => {
          ServiceList.getAllByProvider(provs[p], (err, data) => {
            if (err) {
              reject(err);
              log(err);
            } else {
              data.forEach((dd) => lists.push(dd));
              resolve();
            }
          });
        }).catch((err) => {
          log(err);
        })
      );
    }
    await Promise.all(promises).catch((err) => log(err));
    res.send(lists);
  }
};

// Retrieve all Lists from the database.
exports.findAllByProvider = (req, res) => {

  const providerId = +req.params.providerId; // sanitize...
  const user = req.user;
  let provs = req.user.Providers ?? [];
  if (provs.includes(providerId) || user.Role == "admin") {
    let provider = providerId;

    ServiceList.getAllByProvider(provider, (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving lists.",
        });
      else res.send(data);
    });
  } else {
    res.status(401).send({
      message: "Unauthorised",
    });
  }
};

// find with status and by provider (optonal)
//
exports.findWithStatus = (req, result, status = "active", provider = null) => {
  ServiceList.getAllByStatus(
    (err, data) => {
      if (err) result(err, null);
      else result(null, data);
    },
    status,
    provider
  ); // is status is null defaults to "active"
};

// Find a single List with a listId
exports.findOne = (req, res) => {
  let validrequest = true;

  // Id is a valid number
  const listId = req.params.listId;
  if (isNaN(listId)) {
    validrequest = false;
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  ServiceList.findById(req.params.listId, (err, data) => {
    if (err) {
      if (err.Name === "not_found") {
        res.status(404).send({
          message: `Not found List with id ${req.params.listId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving List with id " + req.params.listId,
        });
      }
    } else {
      // check if the found list is by one of the user's providers (if not admin)
      if (req.user.Role !== "admin") {
        let providers = req.user.Providers ?? [];
        if (!providers.includes(data.ProviderId)) {
          res.status(400).send({
            message: "Invalid request!",
          });
          return;
        }
      }

      res.send(data);
    }
  });
};

exports.findById = (req, res) => {
  let validrequest = true;

  // Id is a valid number
  const listId = req.params.listId;
  if (!listId) {
    validrequest = false;
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  ServiceList.findByUniqueId(req.params.listId, (err, data) => {
    if (err) {
      if (err.Name === "not_found") {
        res.status(404).send({
          message: `Not found List with id ${req.params.listId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving List with id " + req.params.listId,
        });
      }
    } else {
      // check if the found list is by one of the user's providers (if not admin)
      if (req.user.Role !== "admin") {
        let providers = req.user.Providers ?? [];
        if (!providers.includes(data.ProviderId)) {
          res.status(400).send({
            message: "Invalid request!",
          });
          return;
        }
      }

      res.send(data);
    }
  });
};
// update
exports.update = async (req, res) => {
  const listId = req.params.listId;

  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  if (isNaN(listId)) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  // check users ownership of list's provider
  const listCheck = await ServiceList.listHeaderById(listId);
  let provs = req.user.Providers ?? [];
  let valid = true;

  if (listCheck) {
    if (!provs.includes(+listCheck.Provider) && req.user.Role != "admin") {
      valid = false;
    }
  } else valid = false;

  if (!valid) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  ServiceList.updateById(listId, new ServiceList(req.body), (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error updating List" + (err.msg ? ": " + err.msg : ""),
      });
    } else {
      res.send(data);

      const event = {
        id: req.params.listId,
        user: req.user,
        eventType: "Update",
        Name: req.body.Names[0].name,
        //ContentJson: ""
      };

      EventHistory.create(event, (err, res) => {
        if (err) {
          log(err);
        }
      });
    }
  });
};

// delete
exports.delete = async (req, res) => {
  const listId = req.params.listId;

  // check users ownership of list's provider
  const listCheck = await ServiceList.listHeaderById(listId);
  let provs = req.user.Providers ?? [];
  let valid = true;

  if (listCheck) {
    if (!provs.includes(+listCheck.Provider) && req.user.Role != "admin") {
      valid = false;
    }
  } else valid = false;

  if (!valid) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  ServiceList.remove(req.params.listId, (err, data) => {
    if (err) {
      if (err.list === "not_found") {
        res.status(404).send({
          message: `Not found List with id ${req.params.listId}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete List with id " + req.params.listId,
        });
      }
    } else {
      res.send({ message: `List was deleted successfully!` });

      const event = {
        id: req.params.listId,
        user: req.user,
        eventType: "Delete",
      };

      EventHistory.create(event, (err, res) => {
        if (err) {
          log(err);
        }
      });
    }
  });
};

// delete all per provider
exports.deleteProviderLists = async (req, providerId) => {
  // get provider lists
  const data = await ServiceList.getAllProviderServiceListOfferings(providerId).catch((err) => {
    log(err);
  });

  if (data) {
    let promises = [];

    for (let i = 0; i < data.length; i++) {
      promises.push(
        new Promise((resolve, reject) => {
          let listId = data[i].Id;
          ServiceList.remove(listId, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve();

              const event = {
                id: listId,
                user: req.user,
                eventType: "Delete",
              };

              EventHistory.create(event, (err, res) => {
                if (err) {
                  log(err);
                }
              });
            }
          });
        }).catch((err) => {
          log(err);
        })
      );
    }

    await Promise.all(promises).catch((err) => log(err));
  }
};
