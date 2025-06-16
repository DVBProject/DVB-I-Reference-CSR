const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { log } = require("../../logging.js");

// create
exports.create = async (req, res) => {
  if (req.user.Role !== "admin") {
    return res.status(401).json({ success: false });
  }

  const { Name, Role, Password, Email, Providers } = req.body;
  let valid = true;

  if (!Name || !Name.length) {
    valid = false;
  }

  if (!valid) {
    return res.status(500).json({ success: false });
  }
  //Empty password hash for publisher role. no password login, only access token 
  const passwordHash = Role != "publisher" ? await bcrypt.hash(Password, 8) : '';

  const user = new User({
    Name: Name,
    Email: Email,
    passwordhash: passwordHash,
    Role: Role,
    Organization: 0,
    Providers: JSON.stringify(Providers) ||  '[]',
    Session: 1,
  });

  const newUser = await User.create(user);
  if (newUser) {
    return res.status(200).json({ success: true, Id: newUser.insertId });
  } else {
    return res.status(500).json({ success: false });
  }
};

exports.findOne = (req, res) => {
  // privileges: user should be able to find their own data

  User.findById(req.params.userId)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      if (err.Name === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.params.userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with id " + req.params.userId,
        });
      }
    });
};

exports.getCurrent = (req,res) => {
  const id = req.user.Id;
  User.findById(id)
    .then((data) => {
      delete data[0]["Session"];
      res.send(data);
    })
    .catch((err) => {
      if (err.Name === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.params.userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with id " + req.params.userId,
        });
      }
    });

}

// find all users
exports.findAll = (req, res) => {
  if (!req.user) {
    res.status(500).send({
      message: err.message || "Not authorized.",
    });
    return;
  }

  // check that user is admin
  if (req.user.Role == "admin") {
    User.getAll()
      .then((data) => {
        const from = data.findIndex((user) => user.Id === req.user.Id)
        data.splice(0, 0, data.splice(from, 1)[0]);
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving users.",
        });
      });
  } else {
    // return just users own data
    const id = req.user.Id;
    User.findById(id)
      .then((data) => {
        delete data[0]["Session"];
        delete data[0]["Role"];
        res.send(data);
      })
      .catch((err) => {
        if (err.Name === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`,
          });
        } else {
          res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId,
          });
        }
      });
  }
};

// Retrieve all for a provider
exports.findAllByProvider = (req, res) => {
  const providerId = +req.params.providerId;
  const user = req.user;

  let provs = req.user.Providers ?? [];

  if (provs.includes(providerId) || user.Role == "admin") {
    let provider = providerId;

    User.getAllByProvider(provider, (err, data) => {
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

exports.changePassword = async (req, res) => {
  let validrequest = true;

  if (!req.body) {
    validrequest = false;
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  let updateData = req.body;

  const user = await User.findByName(req.user.Name);

  if (!user || user.length < 1) {
    return res.status(401).json({ success: false, error: "general error" });
  }
  //Admin password reset
  if (req.user.Role === "admin" && updateData.CurrentUser) {
    const newHash = await bcrypt.hash(updateData.NewPassword, 8);
    User.updatePwd(updateData.CurrentUser, newHash, (err, data) => {
      if (err) {
        res.status(500).send({
          message: "Error updating User with id " + req.user.Id,
        });
      } else {
        res.send(data);
      }
    });
  } else {
    const { Id, Hash } = user[0];

    const match = await bcrypt.compare(updateData.Password, Hash);
    if (!match) {
      // old pwd is incorrect
      return res.status(401).json({ success: false, error: "general error" });
    }

    // get new hash
    const newHash = await bcrypt.hash(updateData.NewPassword, 8);

    // update new password hash
    User.updatePwd(Id, newHash, (err, data) => {
      if (err) {
        res.status(500).send({
          message: "Error updating User with id " + req.user.Id,
        });
      } else {
        res.send(data);
      }
    });
  }
};

// update
exports.update = (req, res) => {
  let validrequest = true;
  let updateData = req.body;

  const userId = req.params.userId;

  if (!req.body) {
    validrequest = false;
  }

  if (isNaN(userId)) {
    validrequest = false;
  }

  // a user can only update their own email & remove providers (add providers is elsewhere)
  // (change passwd is done elsewhere)
  if (req.user.Role === "admin" || req.user.Id === updateData.Id) {
    if (req.user.Role !== "admin") {
      // check providers, can only remove providers from existing
      try {
        const oldlist = req.user.Providers ?? [];
        const newlist = updateData.Providers ?? [];

        newlist.forEach((elem) => {
          if (!oldlist.includes(elem)) {
            validrequest = false;
          }
        });
      } catch (err) {
        log(err);
        validrequest = false;
      }
    }
  } else {
    validrequest = false;
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  User.updateById(userId, req.user.Role === "admin", new User(updateData), (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error updating User with id " + req.params.userId,
      });
    } else {
      res.send(data);
    }
  });
};

// remove
exports.delete = (req, res) => {
  let validrequest = true;
  const userId = req.params.userId;

  if (isNaN(userId)) {
    validrequest = false;
  }

  if (req.user.Role !== "admin") {
    validrequest = false;
  }

  if (!validrequest) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }

  User.remove(req.params.userId, (err, data) => {
    if (err) {
      if (err.user === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete User with id " + req.params.userId,
        });
      }
    } else {
      res.send({ message: `User was deleted successfully!` });
    }
  });
};

// log out
exports.logout = (req, res) => {
  const { Id, Session } = req.user;

  let newSession = Session + 1;
  if (newSession > 1000) newSession = 1;

  User.updateSession(Id, newSession, (err, data) => {
    if (err) {
      log(err);
      res.status(400).json({ success: false });
    } else {
      res.send({ success: true });
    }
  });
};

exports.getPublishToken = async (req, res) => {  
  if (req.user.Role !== "admin") {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }
  const userId = req.params.userId;
  const user = await User.findById(userId);

  if (!user || !user[0]) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }
 
 const { Id, Session,Role } = user[0];

 if (Role !== "publisher") {
  res.status(400).send({
    message: "User is not a publisher!",
  });
  return;
 }
 const date = new Date(2100,0, 1, 0, 0, 0, 0)
 const iat = new Date(2025,0, 1, 0, 0, 0, 0)
 
 const token = jwt.sign({ Id, Role, Session,iat:Math.floor(iat.getTime()/1000),exp:Math.floor(date.getTime()/1000)  }, req.app.get("jwtstring"));
 res.send({ token: token });
};

exports.refreshPublishToken = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user || !user[0]) {
    res.status(400).send({
      message: "Invalid request!",
    });
    return;
  }
  const { Id, Session,Role } = user[0];
  if (Role !== "publisher") {
    res.status(400).send({
      message: "User is not a publisher!",
    });
    return;
   }

  let newSession = Session + 1;
  if (newSession > 1000) newSession = 1;

  User.updateSession(Id, newSession, (err, data) => {
    if (err) {
      res.status(400).json({ success: false });
    } else {
      this.getPublishToken(req,res)
    }
  });
};
