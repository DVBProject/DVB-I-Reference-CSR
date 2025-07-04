const { log } = require("../../logging.js");
const sql = require("./db.js");

// constructor
const EventHistory = function (eventHistory) {
  this.User = eventHistory.User;
  this.UserName = eventHistory.UserName;
  this.Event = eventHistory.Event;
  this.Time = eventHistory.Time;
  this.ServiceList = eventHistory.ServiceList;
  this.Name = eventHistory.Name;
  try {
    this.ContentJson = JSON.stringify(eventHistory.ContentJson);
  } catch {
    this.ContentJson = "[]";
  }
};

EventHistory.create = (newEvent, result) => {
  sql.query("INSERT INTO EventHistory SET ?", newEvent, (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    result(null, res);
  });
};

EventHistory.findById = (ListId, result) => {
  sql.query("SELECT * FROM EventHistory WHERE ServiceList = ?", ListId, async (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res);
      return;
    }

    result({ Name: "not_found" }, null);
  });
};

module.exports = EventHistory;
