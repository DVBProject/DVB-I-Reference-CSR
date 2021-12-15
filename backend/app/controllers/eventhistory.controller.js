const EventHistory = require("../models/eventhistory.model.js")


// create, called only by other internal routes
exports.create = (data, result) => {
    // Validate request
    if (!data) {
        result("err: data is null", null)
        return
    }
  
    console.debug(data)

    const event = new EventHistory({
        User : data.user.Id,
        UserName: data.user.Name,
        Event : data.eventType || "Create",
        Time : Date.now(),
        ServiceList : data.id || 0,
        Name: data.Name || "" 
      })

    EventHistory.create(event, (err, data) => {
        if(err) {
            console.log("error creating history event")
            result(err, null)
            return
        }

        if(!data) {
            console.log("error creating history event")
            result("EventHistory. create err: null data", null)
            return
        }

        result(null, data)
    })
  
  }


// Find event of a single List with a listId
exports.findOne = (req, res) => {
    EventHistory.findById(req.params.listId, (err, data) => {
      if (err) {
        if (err.Name === "not_found") {
          /*res.status(404).send({
            message: `Not found List with id ${req.params.listId}.`
          });*/
          res.send([]);
        } else {
          res.status(500).send({
            message: "Error retrieving List with id " + req.params.listId
          });
        }
      } else res.send(data);
    });
  };

