const { log } = require("../../logging.js");
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

const jsonfields = [
  "Address",
  "ContactName",
  "ElectronicAddress",
  "Jurisdiction",
  "Kind",
  "Icons",
];
Provider.create = (newProvider, Names, result) => {
  if (!Names || Names.length == 0) {
    result({ message: "Provider name required!" }, null);
    return;
  }
  for (const Name of Names) {
    if (Name.name == "") {
      result({ message: "Provider cannot be empty!" }, null);
      return;
    }
  }
  for (let field of jsonfields) {
    try {
      newProvider[field] = JSON.stringify(newProvider[field]);
    } catch (e) {
      log(err);
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
        log(err);
        result(err, null);
        return;
      }

      const orgId = res.insertId;

      for (const index in Names) {
        const data = { ...Names[index], organization: orgId };

        sql.query("INSERT INTO EntityName SET ?", data, (err, res) => {
          if (err) {
            log(err);
          }
        });
      }

      //Assume for now only one ServiceListRegistry, use id 1
      sql.query(
        "INSERT INTO ProviderOffering(Organization,ServiceListRegistry,updatedUtc) VALUES (?,?,utc_timestamp())",
        [orgId /*res.insertId*/, 1],
        (err, res) => {
          if (err) {
            log(err);
            result(err, null);
            return;
          }

          result(null, { id: res.insertId, ...newProvider });
        }
      );
    }
  );
};

Provider.findById = (ProviderId, result) => {
  sql.query(
    `SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator,Organization.Icons,ProviderOffering.updatedUtc FROM ProviderOffering,Organization,EntityName WHERE ProviderOffering.Id = ? AND ProviderOffering.Organization = Organization.Id `,
    [ProviderId],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      if (res.length) {
        res[0].Regulator = res[0].Regulator != 0;

        // fetch names
        let provider = res[0];
        for (let field of jsonfields) {
          try {
            provider[field] = JSON.parse(provider[field]);
          } catch (e) {
            provider[field] = {};
            log(err);
          }
        }
        const names = await getNames(provider).catch((err) => {
          log(err);
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
    "SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind, Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator,Organization.Icons,ProviderOffering.updatedUtc  FROM ProviderOffering,Organization where ProviderOffering.Organization = Organization.Id",
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      try {
        for (let i = 0; i < res.length; i++) {
          let provider = res[i];
          for (let field of jsonfields) {
            try {
              provider[field] = JSON.parse(provider[field]);
            } catch (e) {
              log(err);
            }
          }
          // Fetch Names
          const names = await getNames(provider).catch((err) => {
            log(err);
          });
          provider.Names = [];
          if (names) {
            names.forEach((n) => {
              provider.Names.push({ name: n.Name, type: n.Type });
            });
          }
        }
      } catch (err) {
        log(err);
        result(err, null);
        return;
      }
      result(null, res);
    }
  );
};

Provider.updateById = (id, Provider, result) => {
  if (!Provider.Names || Provider.Names.length == 0) {
    result({ message: "Provider name required!" }, null);
    return;
  }
  for (const Name of Provider.Names) {
    if (Name.name == "") {
      result({ message: "Provider name cannot be empty!" }, null);
      return;
    }
  }
  sql.query(
    "UPDATE ProviderOffering SET updatedUtc = utc_timestamp() WHERE Id = ?",
    id
  );

  sql.query(
    "SELECT Organization FROM ProviderOffering WHERE Id = ?",
    id,
    (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }
      const orgId = res[0].Organization;
      for (let field of jsonfields) {
        try {
          Provider[field] = JSON.stringify(Provider[field]);
        } catch (e) {
          result(e, null);
          log(e);
          return;
        }
      }
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
            log(err);
            result(err, null);
            return;
          }
          // update names
          await removeNames(orgId);
          await createNames(orgId, Provider);
          result(null, { id: id, ...Provider });
        }
      );
    }
  );
};

Provider.remove = (id, result) => {
  sql.query(
    "SELECT Organization FROM ProviderOffering WHERE Id = ?",
    id,
    (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }
      //delete organization, cascade will remove the provideroffering
      const orgId = res[0].Organization;
      sql.query("DELETE FROM Organization WHERE id = ?", orgId, (err, res) => {
        if (err) {
          log(err);
          result(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          // not found Provider with the id
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, res);
      });
    }
  );
};

Provider.removeAll = (result) => {
  sql.query("DELETE FROM Providers", (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

function removeNames(id) {
  return new Promise((resolve, reject) => {
    sql.query(
      `DELETE FROM EntityName where EntityName.Organization = ?`,
      [id],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
}

async function createNames(orgId, provider) {
  let promises = [];
  for (const index in provider.Names) {
    const data = { ...provider.Names[index], organization: orgId };
    // with promise.all the names are not always saved in the same order
    //promises.push(
    await new Promise((resolve, reject) => {
      sql.query("INSERT INTO EntityName SET ?", data, (err, res) => {
        if (err) {
          log(err);
          reject();
        }
        resolve();
      });
    }).catch((err) => {
      return err;
    });
  }
}

function getNames(provider) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM EntityName where EntityName.Organization = ?`,
      [provider.Organization],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
}

Provider.findByName = (name) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT ProviderOffering.Id FROM EntityName, ProviderOffering where EntityName.Name = ? and EntityName.Organization != 1 and EntityName.Organization = ProviderOffering.Organization",
      [name],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

module.exports = Provider;
