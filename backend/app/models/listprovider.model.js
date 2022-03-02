const sql = require("./db.js");

// constructor
const Listprovider = function(Provider) {
    this.Kind = Provider.Kind;
    this.ContactName = Provider.ContactName;
    this.Jurisdiction = Provider.Jurisdiction;
    this.Address = Provider.Address;
    this.ElectronicAddress = Provider.ElectronicAddress;
    this.Regulator = Provider.Regulator ? 1 : 0;
    this.Names = Provider.Names || []
    this.Language = Provider.Language;
    this.Icons = Provider.Icons || []
};


Listprovider.getProvider = result => {
    sql.query(`SELECT Organization.Id,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator,Organization.Icons,ServiceListEntryPoints.Language FROM ServiceListEntryPoints,Organization,EntityName WHERE ServiceListEntryPoints.Id = 1 AND ServiceListEntryPoints.ServiceListRegistryEntity = Organization.Id `, async (err, res) => {
        if (err) {
            console.log("findById error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            res[0].Regulator = res[0].Regulator != 0;
            //console.log("found Provider: ", res[0]);

            // fetch names
            let provider = res[0]
            const jsonfields = ["Address","ContactName","ElectronicAddress","Jurisdiction","Kind","Icons"]
            for(let field of jsonfields) {
                try {
                    provider[field] = JSON.parse(provider[field]);
                }
                catch(e) {
                    console.log("parse error in field",field, err);
                }
            }
            const names = await getNames(provider).catch(err => {
                console.log("findById, getNames error: ", err)
            })
            provider.Names = []
            if(names) {
                names.forEach(n => {
                    provider.Names.push({name: n.Name, type: n.Type})
                })
            }

            result(null, res[0]);
            return;
        }

        // not found Provider with the id
        result({ kind: "not_found" }, null);
    });
};


Listprovider.update = (Provider, result) => {
    console.log('update Provider')//,Provider,id);

    if(!Provider.Names || Provider.Names.length == 0 || Provider.Names[0].name == '') {
        result({message: "Provider name required!"}, null);
        return;
    }
    sql.query("SELECT ServiceListRegistryEntity,Language FROM ServiceListEntryPoints WHERE Id = 1", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log(res[0].ServiceListRegistryEntity);
        if(res[0].Language != Provider.Language) {
            sql.query(
                "UPDATE ServiceListEntryPoints SET Language = ? WHERE Id = 1",Provider.Language,
            );
        }
        const orgId = res[0].ServiceListRegistryEntity
        sql.query(
            "UPDATE Organization SET Kind = ?, ContactName = ?, Jurisdiction = ?,Address = ?,ElectronicAddress = ?,Regulator = ?,Icons = ? WHERE Id = ?",
            [Provider.Kind, Provider.ContactName, Provider.Jurisdiction,Provider.Address,Provider.ElectronicAddress,Provider.Regulator ? 1 : 0,Provider.Icons, orgId],
            async (err, res) => {
            if (err) {
                console.log("Organization update error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                console.log("Affected rows",res.affectedRows);
                // not found Provider with the id
                //result({ kind: "not_found" }, null);
                //return;
            }

            // update names
            await removeNames(orgId)
            await createNames(orgId, Provider)

            console.log("updated Provider: ", { ...Provider });
            result(null, { ...Provider });
            }
        );
    });
};


function removeNames(id) {
    return new Promise((resolve, reject) => {
        sql.query(`DELETE FROM EntityName where EntityName.Organization = ${id}`, (err, res) => {
            if (err) {
                console.log("EntityName delete error: ", err);
                reject(err)
            }
            else {          
                resolve(res)
            }
        })
   })
}

async function createNames(orgId, provider) {
    let promises = []
    for(index in provider.Names) {
        const data = {...provider.Names[index], organization: orgId}
        promises.push(
            new Promise((resolve, reject) => {
                sql.query("INSERT INTO EntityName SET ?", data, (err, res) => {
                    if (err) {
                        console.log("EntityName insert error: ", err);
                        reject()
                    }
                    resolve()
                })
            }).catch(err => {return err}) )
    }
    await Promise.all(promises).catch(err => console.log("createNames ALL", err))
}

function getNames(provider) {
    return new Promise((resolve, reject) => {
         sql.query(`SELECT * FROM EntityName where EntityName.Organization = ${provider.Id}`, (err, res) => {
             if (err) {
                 console.log("EntityName get error: ", err);
                 reject(err)
             }
             else {          
                 resolve(res)
             }
         })
    })
 }

module.exports = Listprovider;
