const { log } = require("../../logging.js");
const EventHistory = require("../models/eventhistory.model.js");

// create, called only by other internal routes
exports.create = (data, result) => {
  // Validate request
  if (!data) {
    result("err: data is null", null);
    return;
  }
  const event = new EventHistory({
    User: data.user.Id,
    UserName: data.user.Name,
    Event: data.eventType || "Create",
    Time: Date.now(),
    ServiceList: data.id || 0,
    Name: data.Name || "",
    ContentJson: data.ContentJson || "",
  });

  EventHistory.create(event, (err, data) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    if (!data) {
      result("EventHistory. create err: null data", null);
      return;
    }

    result(null, data);
  });
};

// Find event of a single List with a listId
exports.findOne = (req, res) => {
  EventHistory.findById(req.params.listId, (err, data) => {
    if (err) {
      if (err.Name === "not_found") {
        res.send([]);
      } else {
        res.status(500).send({
          message: "Error retrieving List with id " + req.params.listId,
        });
      }
    } else res.send(data);
  });
};
