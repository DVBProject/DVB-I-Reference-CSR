const sql = require("./db.js");

// constructor
const Provider = function (Provider) {
  this.Kind = Provider.Kind;
  this.ContactName = Provider.ContactName;
  this.Jurisdiction = Provider.Jurisdiction;
  this.Address = Provider.Address;
  this.ElectronicAddress = Provider.ElectronicAddress;
  this.Regulator = Provider.Regulator ? 1 : 0;
  this.Names = Provider.Names || [];
  this.Icons = Provider.Icons || [];
};

const jsonfields = ["Address", "ContactName", "ElectronicAddress", "Jurisdiction", "Kind", "Icons"];
Provider.create = (newProvider, Names, result) => {
  if (!Names || Names.length == 0) {
    result({ message: "Provider name required!" }, null);
    return;
  }
  for (var Name of Names) {
    if (Name.name == "") {
      result({ message: "Provider cannot be empty!" }, null);
      return;
    }
  }
  sql.query(
    "INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator,Icons) VALUES (?,?,?,?,?,?,?)",
    [
      newProvider.Kind,
      newProvider.ContactName,
      newProvider.Jurisdiction,
      newProvider.Address,
      newProvider.ElectronicAddress,
      newProvider.Regulator,
      newProvider.Icons,
    ],
    (err, res) => {
      if (err) {
        console.log("provider create error: ", err);
        result(err, null);
        return;
      }

      console.log("created Organization: ", { id: res.insertId, ...newProvider });
      // check if serviceListRegistry exixst, create if not.. TODO

      // create a new name table entry for the new organization + type
      //EntityName.name, EntityName.type
      const orgId = res.insertId;

      for (index in Names) {
        const data = { ...Names[index], organization: orgId };

        sql.query("INSERT INTO EntityName SET ?", data, (err, res) => {
          if (err) {
            console.log("error: ", err);

            // ei varmaan pida tassa vaiheessa palauttaa requa..
            //result(err, null);
            //return;
          }
        });
      }

      //Assume for now only one ServiceListRegistry, use id 1
      sql.query(
        "INSERT INTO ProviderOffering(Organization,ServiceListRegistry) VALUES (?,?)",
        [orgId /*res.insertId*/, 1],
        (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }
          console.log("created ProviderOffering");
          result(null, { id: res.insertId, ...newProvider });
        }
      );
    }
  );
};

Provider.findById = (ProviderId, result) => {
  sql.query(
    `SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator,Organization.Icons FROM ProviderOffering,Organization,EntityName WHERE ProviderOffering.Id = ? AND ProviderOffering.Organization = Organization.Id `,
    [ProviderId],
    async (err, res) => {
      if (err) {
        console.log("findById error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        res[0].Regulator = res[0].Regulator != 0;
        //console.log("found Provider: ", res[0]);

        // fetch names
        let provider = res[0];
        for (let field of jsonfields) {
          try {
            provider[field] = JSON.parse(provider[field]);
          } catch (e) {
            console.log("parse error in field", field, err);
          }
        }
        const names = await getNames(provider).catch((err) => {
          console.log("findById, getNames error: ", err);
        });
        provider.Names = [];
        if (names) {
          names.forEach((n) => {
            provider.Names.push({ name: n.Name, type: n.Type });
          });
        }

        result(null, res[0]);
        return;
      }

      // not found Provider with the id
      result({ kind: "not_found" }, null);
    }
  );
};

Provider.getAll = (result) => {
  sql.query(
    "SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind, Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator,Organization.Icons  FROM ProviderOffering,Organization where ProviderOffering.Organization = Organization.Id",
    async (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      try {
        for (i = 0; i < res.length; i++) {
          let provider = res[i];
          for (let field of jsonfields) {
            try {
              provider[field] = JSON.parse(provider[field]);
            } catch (e) {
              console.log("parse error in field", field, err);
            }
          }
          // Fetch Names
          const names = await getNames(provider).catch((err) => {
            console.log("error: ", err);
          });
          provider.Names = [];
          if (names) {
            names.forEach((n) => {
              provider.Names.push({ name: n.Name, type: n.Type });
            });
          }
          //console.log(provider.Names)
        }
      } catch (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      console.log("Providers: ", res.length);
      result(null, res);
    }
  );
};

Provider.updateById = (id, Provider, result) => {
  console.log("update Provider"); //,Provider,id);

  if (!Provider.Names || Provider.Names.length == 0) {
    result({ message: "Provider name required!" }, null);
    return;
  }
  for (var Name of Provider.Names) {
    if (Name.name == "") {
      result({ message: "Provider name cannot be empty!" }, null);
      return;
    }
  }

  sql.query("SELECT Organization FROM ProviderOffering WHERE Id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    //console.log(res[0].Organization,id);
    const orgId = res[0].Organization;
    sql.query(
      "UPDATE Organization SET Kind = ?, ContactName = ?, Jurisdiction = ?,Address = ?,ElectronicAddress = ?,Regulator = ?, Icons = ? WHERE Id = ?",
      [
        Provider.Kind,
        Provider.ContactName,
        Provider.Jurisdiction,
        Provider.Address,
        Provider.ElectronicAddress,
        Provider.Regulator ? 1 : 0,
        Provider.Icons,
        res[0].Organization,
      ],
      async (err, res) => {
        if (err) {
          console.log("Organization update error: ", err);
          result(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          console.log("Affected rows", res.affectedRows);
          // not found Provider with the id
          //result({ kind: "not_found" }, null);
          //return;
        }

        // update names
        await removeNames(orgId);
        await createNames(orgId, Provider);

        console.log("updated Provider: ", { id: id, ...Provider });
        result(null, { id: id, ...Provider });
      }
    );
  });
};

Provider.remove = (id, result) => {
  console.log("remove Provider");
  sql.query("SELECT Organization FROM ProviderOffering WHERE Id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    //console.log(res[0].Organization,id);
    //delete organization, cascade will remove the provideroffering
    const orgId = res[0].Organization;
    sql.query("DELETE FROM Organization WHERE id = ?", orgId, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Provider with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("deleted Provider with id: ", id);
      result(null, res);
    });
  });
};

Provider.removeAll = (result) => {
  console.log("remove ALL Providers");
  sql.query("DELETE FROM Providers", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log(`deleted ${res.affectedRows} Providers`);
    result(null, res);
  });
};

function removeNames(id) {
  return new Promise((resolve, reject) => {
    sql.query(`DELETE FROM EntityName where EntityName.Organization = ?`, [id], (err, res) => {
      if (err) {
        console.log("EntityName delete error: ", err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function createNames(orgId, provider) {
  let promises = [];
  for (index in provider.Names) {
    const data = { ...provider.Names[index], organization: orgId };
    // with promise.all the names are not always saved in the same order
    //promises.push(
    await new Promise((resolve, reject) => {
      sql.query("INSERT INTO EntityName SET ?", data, (err, res) => {
        if (err) {
          console.log("EntityName insert error: ", err);
          reject();
        }
        resolve();
      });
    }).catch((err) => {
      return err;
    });
    //)
  }
  //await Promise.all(promises).catch(err => console.log("createNames ALL", err))
}

function getNames(provider) {
  return new Promise((resolve, reject) => {
    sql.query(`SELECT * FROM EntityName where EntityName.Organization = ?`, [provider.Organization], (err, res) => {
      if (err) {
        console.log("EntityName get error: ", err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

module.exports = Provider;
