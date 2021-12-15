const sql = require("./db.js");


// constructor
const EventHistory = function(eventHistory) {
    this.User = eventHistory.User
    this.UserName = eventHistory.UserName
    this.Event = eventHistory.Event
    this.Time = eventHistory.Time
    this.ServiceList = eventHistory.ServiceList
    this.Name = eventHistory.Name
}


EventHistory.create = (newEvent, result) => {
    console.log("new", newEvent)

    sql.query("INSERT INTO EventHistory SET ?", newEvent, (err, res) => {
        if (err) {
            console.log("EventHistory create error: ", err);
            result(err, null);
            return;
        }

        result(null, res)
    })
}


EventHistory.findById = (ListId, result) => {
    console.log("EventHistory for List", ListId) 
    sql.query("SELECT * FROM EventHistory WHERE ServiceList = ?", ListId, async (err, res) => {        
        if (err) {
            console.log("error: ", err)
            result(err, null)
            return
        }
    
        if (res.length) {                  
            result(null, res)
            return
        }
    
        // not found List with the id
        result({ Name: "not_found" }, null)
    })
}


module.exports = EventHistory

// findById

