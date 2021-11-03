const sql = require("./db.js");

// constructor
const ServiceList = function(serviceList) {
    this.Name = serviceList.Name
    this.lang = serviceList.lang,
    this.URI = serviceList.URI
    this.Provider = serviceList.Provider
    this.regulatorList = serviceList.regulatorList
    this.Delivery = serviceList.Delivery
}


ServiceList.create = (newServiceList, result) => { 
    // check user rights

    // TODO: now only saves the first item on the delivery-list !!
    sql.query("INSERT INTO ServiceListOffering SET Provider = ?, regulatorList = ?, Delivery = ?", [newServiceList.Provider, newServiceList.regulatorList, newServiceList.Delivery[0]], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created ServiceListOffering: ", { id: res.insertId, ...newServiceList });

        // Create new List Name
        // TODO: now only saves with the first item on the languages list  
        sql.query("INSERT INTO ServiceListName SET ServiceList = ?, Name = ?, lang = ?",  [res.insertId, newServiceList.Name, newServiceList.lang[0].a3], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            console.log("created service list NAME", res)
        })

        // Create new URI
        sql.query("INSERT INTO ServiceListURI SET URI = ?, ServiceList = ?",  [newServiceList.URI,res.insertId], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            console.log("created service list URI", res)
        })

        // Create new languages for this service list
        for(var index in newServiceList.lang) {
            sql.query("INSERT INTO Language SET Language = ?, ServiceList = ?",  [newServiceList.lang[index].a3, res.insertId], (err, res) => {
                if (err) {
                    console.log("error: ", err);
                }
                console.log("created service list lang", res)
            })
        }

        // Target countries

        // Create genres

        
        result(null, { id: res.insertId, ...newServiceList });       
    });
};


ServiceList.findById = (ListId, result) => {
    sql.query(`SELECT ServiceListOffering.Id,ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering WHERE ServiceListOffering.Id = ${ListId} AND ServiceListName.ServiceList = ServiceListOffering.Id AND ServiceListURI.ServiceList = ServiceListOffering.Id`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
    
        if (res.length) {            
            console.log("found List items: ", res[0]);
            result(null, res[0]);
            return;
        }
    
        // not found List with the id
        result({ Name: "not_found" }, null);
    });
};


ServiceList.getAll = result => {

    sql.query("SELECT ServiceListOffering.Id,ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering where ServiceListName.ServiceList = ServiceListOffering.Id AND ServiceListURI.ServiceList = ServiceListOffering.Id", (err, res) => {
        if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
        }
    
        console.log("ServiceLists: ", res);

        result(null, res);
    });
};


ServiceList.updateById = (id, List, result) => {
}

ServiceList.remove = (id, result) => {
}

ServiceList.removeAll = result => {
}


module.exports = ServiceList;
