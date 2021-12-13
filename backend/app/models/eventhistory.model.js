const sql = require("./db.js");


// constructor
const EventHistory = function(eventHistory) {
    this.User = eventHistory.User
    this.Event = eventHistory.Event
    this.Time = eventHistory.Time
    this.ServiceList = eventHistory.ServiceList
}


EventHistory.create = (newEvent, result) => {
    console.log("history create", newEvent)

    sql.query("INSERT INTO EventHistory SET ?", newEvent, (err, res) => {
        if (err) {
            console.log("EventHistory create error: ", err);
            result(err, null);
            return;
        }

        result(null, res) // res tai vaan true ??
    })
}


module.exports = EventHistory;