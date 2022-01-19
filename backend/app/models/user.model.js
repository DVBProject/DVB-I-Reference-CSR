const sql = require("./db.js");


const User = function(newuser) {
    this.Name = newuser.username
    this.Hash = newuser.passwordhash,
    this.Role = newuser.role
    this.Organization = newuser.organization
    this.Providers = "";
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


module.exports = User;