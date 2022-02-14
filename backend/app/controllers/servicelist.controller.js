const ServiceList = require("../models/servicelist.model.js");
const EventHistory = require("../controllers/eventhistory.controller");
const Providers = require("../controllers/provider.controller");

// Create and Save a new List
exports.create = (req, res) => {
    // better validation, TODO

    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return
    }

    // provider check, user must "own" the provider to add a new list
    //const provs = JSON.parse(req.user.Providers)
    let provs = []
    try {
      provs = JSON.parse(req.user.Providers)
    } catch {
      console.log("user data corrupt", req.user)
    }

    if (!provs.includes(+req.body.Provider)) {
      res.status(400).send({
        message: "Invalid request"
      });
      return
    }
  
    // Create a List
    const serviceList = new ServiceList({
        Names: req.body.Names,
        URI: req.body.URI,
        lang: req.body.lang,
        Provider: req.body.Provider,
        regulatorList: req.body.regulatorList,
        Delivery: req.body.Delivery,
        Countries: req.body.Countries,
        Genres: req.body.Genres,
        Status: "active"
    });

  
    // Save List in the database
    ServiceList.create(serviceList, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the List."
        });
      else {
        res.send(data);

        // Log an event for this serviceList's event history
        //
        const event = { 
          ...data,
          Name: req.body.Names[0].name,
          user: req.user,
          eventType: "Create",
          //ContentJson: ""   // this field for actual update contents, possible undo feature
        }

        EventHistory.create( event, (err, res) => {
          if (err) { 
            console.log("List update, create event error:", err)
          }
        })

      }
    });
  };


// Retrieve all Lists from the database.
exports.findAll = async (req, res) => {
  //console.log(req.url, req.ip, "user:", req.user.Name, req.user.Role)
  // check that user is admin
  if(!req.user) {
    res.status(500).send({
      message: "Not authorized."
    });
    return
  }

  if (req.user.Role == "admin") {
    ServiceList.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving lists."
        });
      else res.send(data);
    });
  }
  else {
    // get users providers and their lists
    //let provs = JSON.parse(req.user.Providers)
    let provs = []
    try {
      provs = JSON.parse(req.user.Providers)
    } catch {
      console.log("user data corrupt", req.user)
    }
    let lists = []
    let promises = []
    for( p in provs ) { 
      promises.push(new Promise(async (resolve, reject) => {
        ServiceList.getAllByProvider(provs[p], (err, data) => {
          if (err) {
            reject(err)
            console.log("error getting list", provs[p])
          }
          else {
            data.forEach(dd => lists.push(dd))            
            resolve()
          }
        })
      }).catch(err => {
        console.log("get users lists error:", err)
      }))
      
    }
    await Promise.all(promises).catch(err => console.log("ALL", err))
    //console.log(lists)

    res.send(lists)
  }
};


// Retrieve all Lists from the database.
exports.findAllByProvider = (req, res) => {
  //console.log(req.url, req.ip, "user:", req.user.Name, req.user.Role)

  const providerId = +req.params.providerId  // sanitize...
  const user = req.user
  //const provs = JSON.parse(req.user.Providers)
  let provs = []
  try {
    provs = JSON.parse(req.user.Providers)
  } catch {
    console.log("user data corrupt", req.user)
  }


  if (provs.includes(providerId) || user.Role == 'admin') {
    let provider = providerId
    
    ServiceList.getAllByProvider(provider, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving lists."
        })
      else res.send(data)
    })
  }
  else {
    console.log("findAllByProvider error, no permission", user.Role)
    res.status(500).send({
      message: "Unauthorised"
    })
  }

}


// find with status and by provider (optonal)
//
exports.findWithStatus = (req, result, status = 'active', provider = null ) => {
  //console.log(req.url, req.ip, "user:", req.user.Name, req.user.Role)

  /*
  // check status validity
  if(['active','suspended','deleted'].indexOf(status) == -1) {
    console.log("invalid status")
    result("err: invalid status", null)
    return
  }
  */

  ServiceList.getAllByStatus((err, data) => {
      if (err) result(err, null)
      else result(null, data)
    }, status, provider ); // is status is null defaults to "active"
}


// Find a single List with a listId
exports.findOne = (req, res) => {

  let validrequest = true

  // Id is a valid number
  const listId = req.params.listId
  if (isNaN(listId)) {
    validrequest = false
  }

  if(!validrequest) {
    res.status(400).send({
      message: "Invalid request!"
    })
    return
  }

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
    } 
    else {
      // check if the found list is by one of the user's providers (if not admin)
      if (req.user.Role !== 'admin') {
        //const providers = JSON.parse(req.user.Providers)
        let providers = []
        try {
          providers = JSON.parse(req.user.Providers)
        } catch {
          console.log("user data corrupt", req.user)
        }
        
        if (!providers.includes(data.ProviderId)) {
          res.status(400).send({
            message: "Invalid request!"
          })
          return
        }
      }

      res.send(data);
    } 
  });
};

// update
// 
exports.update = async (req, res) => {
  // check for auth,
  // 

  const listId = req.params.listId

  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return
  }

  if (isNaN(listId)) {
    res.status(400).send({
      message: "Invalid request!"
    });
    return
  }

  // check users ownership of list's provider
  const listCheck = await ServiceList.listHeaderById(listId)
  //const provs = JSON.parse(req.user.Providers)
  let provs = []
  try {
    provs = JSON.parse(req.user.Providers)
  } catch {
    console.log("user data corrupt", req.user)
  }
  
  let valid = true
  
  if(listCheck) {
    console.log("test")
    if (!provs.includes(+listCheck.Provider) && req.user.Role != 'admin') {
      valid = false
    }
  } 
  else valid = false

  if(!valid) {
    res.status(400).send({
      message: "Invalid request!"
    });
    return
  }

  ServiceList.updateById(
    listId,
    new ServiceList(req.body),
    (err, data) => {
      if (err) {         
        res.status(500).send({
          message: "Error updating List with id " + req.params.listId
        })        
      } 
      else {
        res.send(data);

        const event = { 
          id: req.params.listId,
          user: req.user,
          eventType: "Update",
          Name: req.body.Names[0].name,
          //ContentJson: ""
        }

        EventHistory.create( event, (err, res) => {
          if (err) { 
            console.log("List update, create event error:", err)
          }
        })

      }
    }
  );
};

// delete
exports.delete = (req, res) => {
  ServiceList.remove(req.params.listId, (err, data) => {
    if (err) {
      if (err.list === "not_found") {
        res.status(404).send({
          message: `Not found List with id ${req.params.listId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete List with id " + req.params.listId
        });
      }
    } else {
      res.send({ message: `List was deleted successfully!` });

      const event = {
        id: req.params.listId,
        user: req.user,
        eventType: "Delete",
      }

      EventHistory.create( event, (err, res) => {
        if (err) { 
          console.log("List update, create event error:", err)
        }
      })
    }
  });
};

// delete all per provider
exports.deleteProviderLists = async (req, providerId) => {

  console.log("Delete lists for provider", providerId)
  // get provider lists
  const data = await ServiceList.getAllProviderServiceListOfferings(providerId).catch( err => {
    console.log("getAllProviderServiceListOfferings", err)
  })

  //console.log(data)
  // delete
  if(data) {
    let promises = []

    for (var i = 0; i < data.length; i++) {
      console.log(i, data[i].Id)
      promises.push(new Promise((resolve, reject) => {

        let listId = data[i].Id
        ServiceList.remove(listId, (err, result) => {
          if (err) {
            reject(err)
          } 
          else {
            resolve()

            const event = {
              id: listId,
              user: req.user,
              eventType: "Delete",
            }

            EventHistory.create( event, (err, res) => {
              if (err) { 
                console.log("delete provider lists, create event error:", err)
              }
            })
          }
        })

      }).catch(err => {
        console.log("delete provider lists error:", err)
      }))
    }

    await Promise.all(promises).catch(err => console.log("ALL", err))
  }  
}

