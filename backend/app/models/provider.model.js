const sql = require("./db.js");

// constructor
const Provider = function(Provider) {
    this.Kind = Provider.Kind;
    this.ContactName = Provider.ContactName;
    this.Jurisdiction = Provider.Jurisdiction;
    this.Address = Provider.Address;
    this.ElectronicAddress = Provider.ElectronicAddress;
    this.Regulator = Provider.Regulator ? 1 : 0;
};

Provider.create = (newProvider, result) => {
    sql.query("INSERT INTO Organization SET ?", newProvider, (err, res) => {
        if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
        }

        console.log("created Organization: ", { id: res.insertId, ...newProvider });
        //Assume for now only one ServiceListRegistry, use id 1
        sql.query("INSERT INTO ProviderOffering(Organization,ServiceListRegistry) VALUES (?,?)", [res.insertId,1], err => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            result(null, { id: res.insertId, ...newProvider });
        });
       
    });
};

Provider.findById = (ProviderId, result) => {
sql.query(`SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator FROM ProviderOffering,Organization WHERE ProviderOffering.Id = ${ProviderId} AND ProviderOffering.Organization = Organization.Id`, (err, res) => {
    if (err) {
    console.log("error: ", err);
    result(err, null);
    return;
    }

    if (res.length) {
        res[0].Regulator = res[0].Regulator != 0;
        console.log("found Provider: ", res[0]);
        result(null, res[0]);
        return;
    }

    // not found Provider with the id
    result({ kind: "not_found" }, null);
});
};

Provider.getAll = result => {
sql.query("SELECT ProviderOffering.Id,ProviderOffering.Organization,ProviderOffering.ServiceListRegistry,Organization.Kind,Organization.ContactName,Organization.Jurisdiction,Organization.Address,Organization.ElectronicAddress,Organization.Regulator FROM ProviderOffering,Organization where ProviderOffering.Organization = Organization.Id", (err, res) => {
    if (err) {
    console.log("error: ", err);
    result(null, err);
    return;
    }

    console.log("Providers: ", res);
    result(null, res);
});
};

Provider.updateById = (id, Provider, result) => {
    console.log('update',Provider,id);
    sql.query("SELECT Organization FROM ProviderOffering WHERE Id = ?", id, (err, res) => {
        if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
        }
        console.log(res[0].Organization,id);
        sql.query(
            "UPDATE Organization SET Kind = ?, ContactName = ?, Jurisdiction = ?,Address = ?,ElectronicAddress = ?,Regulator = ? WHERE Id = ?",
            [Provider.Kind, Provider.ContactName, Provider.Jurisdiction,Provider.Address,Provider.ElectronicAddress,Provider.Regulator ? 1 : 0, res[0].Organization],
            (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            if (res.affectedRows == 0) {
                console.log("Affected rows",res.affectedRows);
                // not found Provider with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated Provider: ", { id: id, ...Provider });
            result(null, { id: id, ...Provider });
            }
        );
    });
};

Provider.remove = (id, result) => {
sql.query("DELETE FROM Providers WHERE id = ?", id, (err, res) => {
    if (err) {
    console.log("error: ", err);
    result(null, err);
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
};

Provider.removeAll = result => {
sql.query("DELETE FROM Providers", (err, res) => {
    if (err) {
    console.log("error: ", err);
    result(null, err);
    return;
    }

    console.log(`deleted ${res.affectedRows} Providers`);
    result(null, res);
});
};

module.exports = Provider;