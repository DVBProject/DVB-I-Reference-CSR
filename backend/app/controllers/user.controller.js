const User = require("../models/user.model.js");


// create

// find
exports.findOne = (req, res) => {
    // privileges: user should be able to find their own data

    User.findById(req.params.userId) 
    .then(  data => {        
       res.send(data);
    })
    .catch(err => {
        if (err.Name === "not_found") {
            res.status(404).send({
              message: `Not found user with id ${req.params.userId}.`
            });
        } 
        else {
            res.status(500).send({
                message: "Error retrieving user with id " + req.params.userId
            });
        }
    })
  };

// find all users
exports.findAll = (req, res) => {
    //console.log(req.url, req.ip, "user:", req.user.Name, req.user.Role)
    
    if(!req.user) {
      res.status(500).send({
        message:
          err.message || "Not authorized."
      });
      return
    }

    // check that user is admin
    if (req.user.Role == "admin") {
      User.getAll().then(data => {
        res.send(data);
      })
      .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving users."
          });
      })
    }
    else {  
      res.status(500).send({
        message:
          err.message || "Not authorized."
      })
      console.log("Not auth: user asked getAll", req.user)
    }
};


// update

// remove

