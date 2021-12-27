const ServiceList = require("../models/servicelist.model.js");
const EventHistory = require("../controllers/eventhistory.controller");

// Create and Save a new List
exports.create = (req, res) => {
    // Validate request, user auth, TODO
    
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
  
    // Create a List
    const serviceList = new ServiceList({
        Name: req.body.Name,
        Names: req.body.Names,
        URI: req.body.URI,
        lang: req.body.lang,
        Provider: req.body.Provider,
        regulatorList: req.body.regulatorList,
        Delivery: req.body.Delivery,
        Countries: req.body.Countries,
        Genres: req.body.Genres
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

        const event = { 
          ...data,
          Name: req.body.Names[0].name,
          user: req.user,
          eventType: "Create",
          //ContentJson: ""
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
exports.findAll = (req, res) => {
  //console.log(req.url, req.ip, "user:", req.user.Name, req.user.Role)

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
// 
exports.update = (req, res) => {
  // check for auth,
  // Validate Request & user, TODO
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  ServiceList.updateById(
    req.params.listId,
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
          Name: req.body.Name, //data.Names[0].Name // TODO vaihda kun listoille talletetaan useampi nimi
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

