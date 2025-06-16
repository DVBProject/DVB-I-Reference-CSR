const { log } = require("../../logging.js");
const sql = require("./db.js");

const User = function (newuser) {
  this.Name = newuser.Name;
  this.Email = newuser.Email;
  this.Hash = newuser.passwordhash;
  this.Role = newuser.Role;
  this.Providers = newuser.Providers;
  this.Session = newuser.Session;
};

User.create = (user) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO User SET ?", user, (err, res) => {
      if (err) {
        log(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

User.getAll = () => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM User", (err, res) => {
      if (err) {
        log(err);
        reject(err);
      } else {
        // return everything but the pass hash
        res.forEach((element) => {
          delete element["Hash"];
          element.Providers = JSON.parse(element.Providers);
        });
        resolve(res);
      }
    });
  });
};

// used by admin operations, remove user hash from response
User.findById = (Id) => {
  return new Promise((resolve, reject) => {
    sql.query(`SELECT * FROM User WHERE User.Id = ?`, [Id], (err, res) => {
      if (err) {
        log(err);
        reject(err);
      } else {
        res.forEach((element) => {
          delete element["Hash"];
          element.Providers = JSON.parse(element.Providers);
        });
        resolve(res);
      }
    });
  });
};

// used by auth, so will retrn hash
User.findByName = (Name) => {
  return new Promise((resolve, reject) => {
    sql.query(`SELECT * FROM User WHERE User.Name = ?`, [Name], (err, res) => {
      if (err) {
        log(err);
        reject(err);
      } else {
        for (let i = 0; i < res.length; i++) {
          res[i].Providers = JSON.parse(res[i].Providers);
        }
        resolve(res);
      }
    });
  });
};


User.getAllByProvider = async (provider, result) => {
  sql.query("SELECT User.Id, User.Name, User.Role, User.Providers, User.Email FROM User ", async (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    let list = [];
    for (let i = 0; i < res.length; i++) {
      res[i].Providers = JSON.parse(res[i].Providers);
      try {
        if (res[i].Providers.includes(provider)) {
          list.push(res[i]);
        }
      } catch(err) {
        log(err);
      }
    }

    result(null, list);
  });
};

User.updateById = (Id, admin, newUser, result) => {
  // verify needed data is not missing
  newUser.Name = newUser.Name || "";
  newUser.Email = newUser.Email || "";
  newUser.Role = newUser.Role || "user";
  newUser.Providers = newUser.Providers || [];

  if (admin) {
    sql.query(
      "UPDATE User SET Name = ?, Email = ?, Role = ?, Providers = ? WHERE Id = ?",
      [newUser.Name, newUser.Email, newUser.Role, JSON.stringify(newUser.Providers), Id],
      async (err, res) => {
        if (err) {
          log(err);
          result(err, null);
          return;
        }
        result(null, { Id: Id });
      }
    );
  } else {
    // regular user can only edit these fields
    sql.query(
      "UPDATE User SET Email = ?, Providers = ? WHERE Id = ?",
      [newUser.Email,JSON.stringify( newUser.Providers ), Id],
      async (err, res) => {
        if (err) {
          log(err);
          result(err, null);
          return;
        }
        result(null, { Id: Id });
      }
    );
  }
};

User.remove = async (id, result) => {
  sql.query("DELETE FROM User WHERE Id = ?", id, (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ user: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

// updateSession
User.updateSession = (Id, Session, result) => {
  sql.query("UPDATE User SET Session = ? WHERE Id = ?", [Session, Id], (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    result(null, { Id: Id });
  });
};

User.updatePwd = (Id, Hash, result) => {
  sql.query("UPDATE User SET Hash = ? WHERE Id = ?", [Hash, Id], async (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }
    result(null, { Id: Id });
  });
};

module.exports = User;
