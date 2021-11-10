const sql = require("./db.js");

// constructor
const ServiceList = function(serviceList) {
    this.Name = serviceList.Name
    this.lang = serviceList.lang,
    this.URI = serviceList.URI
    this.Provider = serviceList.Provider
    this.regulatorList = serviceList.regulatorList
    this.Delivery = serviceList.Delivery
    this.Countries = serviceList.Countries,
    this.Genres = serviceList.Genres
}


ServiceList.create = (newServiceList, result) => {

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
        if(newServiceList.Name && newServiceList.lang && newServiceList.lang[0].a3 !== undefined) {
            sql.query("INSERT INTO ServiceListName SET ServiceList = ?, Name = ?, lang = ?",  [res.insertId, newServiceList.Name, newServiceList.lang[0].a3], (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    
                }
                console.log("created service list NAME", res)
            })
        }

        // Create new URI
        if(newServiceList.URI !== undefined) {
            sql.query("INSERT INTO ServiceListURI SET URI = ?, ServiceList = ?",  [newServiceList.URI,res.insertId], (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    
                }
                console.log("created service list URI", res)
            })
        }

        // Create new languages for this service list
        if(newServiceList.lang && newServiceList.lang.length) {
            for(let index in newServiceList.lang) {
                if(newServiceList.lang[index].a3 !== undefined) {
                    sql.query("INSERT INTO Language SET Language = ?, ServiceList = ?",  [newServiceList.lang[index].a3, res.insertId], (err, res) => {
                        if (err) {
                            console.log("error: ", err);
                        }
                        console.log("created service list lang", res)
                    }) 
                }
            }
        }

        // Target countries
        if(newServiceList.Countries && newServiceList.Countries.length) {
            for(let index in newServiceList.Countries) {
                sql.query("INSERT INTO TargetCountry SET Country = ?, ServiceList = ?",  [newServiceList.Countries[index].code, res.insertId], (err, res) => {
                    if (err) {
                        console.log("error: ", err);
                    }
                    console.log("created service list target country", res)
                })
            }
        }


        // Create genres
        if(newServiceList.Genres && newServiceList.Genres.length) {
            //
            for(let index in newServiceList.Genres) {
                sql.query("INSERT INTO Genre SET Genre = ?, ServiceList = ?",  [newServiceList.Genres[index], res.insertId], (err, res) => {
                    if (err) {
                        console.log("error: ", err);
                    }
                    console.log("created service list Genre", res)
                })
            }
        }
        
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
            result(null, res[0]);
            return;
        }
    
        // not found List with the id
        result({ Name: "not_found" }, null);
    });
};


ServiceList.getAll = async result => {
    sql.query("SELECT ServiceListOffering.Id,ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering where ServiceListName.ServiceList = ServiceListOffering.Id AND ServiceListURI.ServiceList = ServiceListOffering.Id", async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        try {
            for(i = 0; i < res.length; i++) {
                let list = res[i]

                // fetch TargetCountries
                const countries = await getTargetCountries(list).catch(err => {
                    console.log("error: ", err)
                })
                
                list.targetCountries = []
                if(countries) {
                    countries.forEach(pack => {
                        list.targetCountries.push({country: pack.Country})
                    })
                }

                // Fetch Languages
                const lang = await getLanguages(list).catch(err => {
                    console.log("error: ", err)
                })
                list.languages = []
                if(lang) {
                    lang.forEach(pack => {
                        list.languages.push({Language: pack.Language})
                    })
                }

                // Fetch Genres
                const genre = await getGenres(list).catch(err => {
                    console.log("error: ", err)
                })
                list.genre = []
                if(genre) {
                    genre.forEach(pack => {
                        list.genre.push(pack.Genre)
                    })
                }
            }
        } catch(err) {
            console.log("error: ", err)
            result(null, err);
            return;
        }
        //console.log("ServiceLists: ", res);
        result(null, res);
    });
};


ServiceList.updateById = (id, List, result) => {
}

ServiceList.remove = (id, result) => {
}

ServiceList.removeAll = result => {
}


// 

function getTargetCountries(list) {
   return new Promise((resolve, reject) => {
        sql.query(`SELECT * FROM TargetCountry where TargetCountry.ServiceList = ${list.Id}`, (err, res) => {
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

function getLanguages(list) {
    return new Promise((resolve, reject) => {
         sql.query(`SELECT * FROM Language where Language.ServiceList = ${list.Id}`, (err, res) => {
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

 function getGenres(list) {
    return new Promise((resolve, reject) => {
         sql.query(`SELECT * FROM Genre where Genre.ServiceList = ${list.Id}`, (err, res) => {
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


module.exports = ServiceList;
