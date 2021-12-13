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
        Event : data.eventType || "Create",
        Time : Date.now(),
        ServiceList : data.id || 0 
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



// findById

// getAll ??