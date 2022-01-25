const sql = require("./db.js");


const User = function(newuser) {
    this.Name = newuser.Name
    this.Email = newuser.Email
    this.Hash = newuser.passwordhash
    this.Role = newuser.Role
    this.Organization = newuser.Organization
    this.Providers = newuser.Providers
}

User.create = (user) => {
    return new Promise((resolve, reject) => {
        sql.query("INSERT INTO User SET ?", user, (err, res) => {
            if (err) {
                console.log("error: ", err);
                reject(err)
            }
            else {          
                resolve(res)
            }
        }) 
    })
}

User.getAll = () => {
    return new Promise((resolve, reject) => {
        sql.query("SELECT * FROM User", (err, res) => {
            if (err) {
                console.log("error: ", err);
                reject(err)
            }
            else {
                // return everything but the pass hash
                res.forEach(element => {
                    delete element['Hash']
                })
                resolve(res)
            }
        })  
    })
}

// used by admin operations, remove user hash from response
User.findById = (Id) => {
    return new Promise((resolve, reject) => {
        sql.query(`SELECT * FROM User WHERE User.Id = ?`, [Id], (err, res) => {
            if (err) {
                console.log("error: ", err);
                reject(err)
            }
            else {
                res.forEach(element => {
                    delete element['Hash']
                })       
                resolve(res)
            }
        })  
    })
}

// used by auth, so will retrn hash
User.findByName = (Name) => {
    return new Promise((resolve, reject) => {
        sql.query(`SELECT * FROM User WHERE User.Name = ?`, [Name], (err, res) => {
            if (err) {
                console.log("error: ", err);
                reject(err)
            }
            else {          
                resolve(res)
            }
        })  
    })
}


User.updateById = (Id, admin, newUser, result) => {
    console.log('update User', Id);

    // verify needed data is not missing
    newUser.Name = newUser.Name || "Not defined"
    newUser.Email = newUser.Email || "Not defined"
    newUser.Role = newUser.Role || "user"
    newUser.Providers = newUser.Providers || "[]"

    if(admin) {
        sql.query(
            "UPDATE User SET Name = ?, Email = ?, Role = ?, Providers = ? WHERE Id = ?",
            [newUser.Name, newUser.Email, newUser.Role, newUser.Providers, Id], 
            async (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }

                console.log("updated User: ", { Id: Id });
                result(null, { Id: Id });
            }
        );
    }
    else { // regular user can only edit these fields
        sql.query(
            "UPDATE User SET Email = ?, Providers = ? WHERE Id = ?",
            [newUser.Email, newUser.Providers, Id], 
            async (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }

                console.log("updated User: ", { Id: Id });
                result(null, { Id: Id });
            }
        );
    }
}

User.remove = async (id, result) => {
    console.log('remove User', id);

    sql.query("DELETE FROM User WHERE Id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return
        }
    
        if (res.affectedRows == 0) {
            console.log("not found User with the id", id)
            result({ user: "not_found" }, null);
            return
        }
        
        console.log("deleted User with id: ", id);
        result(null, res);
    });
}

module.exports = User;