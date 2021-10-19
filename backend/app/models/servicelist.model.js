const sql = require("./db.js");

// constructor
const ServiceList = function(serviceList) {
    this.Name = serviceList.Name
    this.lang = serviceList.lang,
    this.URI = serviceList.URI
    this.Provider = serviceList.Provider
    this.RegulatorList = serviceList.RegulatorList
    this.Delivery = serviceList.Delivery
}


ServiceList.create = (newServiceList, result) => { 
    // check user rights

    sql.query("INSERT INTO ServiceListOffering SET Provider = ?, regulatorList = ?, delivery = ?", [newServiceList.Provider, newServiceList.RegulatorList, newServiceList.Delivery], (err, res) => {
        if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
        }

        console.log("created ServiceListOffering: ", { id: res.insertId, ...newServiceList });

        // Create new List Name
        sql.query("INSERT INTO ServiceListName SET list = ?, Name = ?, lang = ?",  [res.insertId, newServiceList.Name, newServiceList.lang], (err, res) => {
            if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
            }
            console.log("created service list NAME", res)
        })

        // Create new service list entry poitn

        // Create new URI
        // check URI
        sql.query("INSERT INTO ServiceListURI SET URI = ?, list = ?",  [newServiceList.URI,res.insertId], (err, res) => {
            if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
            }
            console.log("created service list URI", res)
        })
        


        result(null, { id: res.insertId, ...newServiceList });       
    });
};

ServiceList.getAll = result => {
    var data = {}
    //sql.query("SELECT * from ServiceListOffering", (err, res) => {
    sql.query("SELECT ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering where ServiceListName.list = ServiceListOffering.Id AND ServiceListURI.list = ServiceListOffering.Id", (err, res) => {
        if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
        }
    
        console.log("ServiceLists: ", res);
        data = {...res}
        

        result(null, res);
    });
};



module.exports = ServiceList;
