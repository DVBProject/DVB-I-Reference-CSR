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

    // verify needed data is not missing
    newServiceList.Name = newServiceList.Name || "Not defined"
    if( !newServiceList.lang || newServiceList.lang.length < 1) newServiceList.lang = [{a3: "Not defined"}]
    newServiceList.URI = newServiceList.URI || "Not defined"
    if(!newServiceList.Delivery || newServiceList.Delivery.length < 1) newServiceList.Delivery = ["DASHDelivery"]
    const deliveries = JSON.stringify(newServiceList.Delivery)

    // TODO: now only saves the first item on the delivery-list !!
    sql.query("INSERT INTO ServiceListOffering SET Provider = ?, regulatorList = ?, Delivery = ?", [ newServiceList.Provider, newServiceList.regulatorList, deliveries ], async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log("created ServiceListOffering: ", { id: res.insertId, ...newServiceList });

        // create all related items
        await createRelatedTables(newServiceList, res.insertId)
        
        result(null, { id: res.insertId, ...newServiceList });       
    });
};


ServiceList.findById = (ListId, result) => {
    sql.query(`SELECT ServiceListOffering.Id,ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering WHERE ServiceListOffering.Id = ${ListId} AND ServiceListName.ServiceList = ServiceListOffering.Id AND ServiceListURI.ServiceList = ServiceListOffering.Id`, async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
    
        if (res.length) {  
            let list = res[0]            
            // fetch all the rest of relevant DB tables
            list = await getRestOfServiceList(list)          
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

        console.time("getAll")
        try {
            for(i = 0; i < res.length; i++) {
                let list = res[i]                
                // fetch all the rest of relevant DB tables
                list = await getRestOfServiceList(list)
            }
        } catch(err) {
            console.log("error: ", err)
            result(null, err);
            return;
        }
        console.timeEnd("getAll")
        //console.log("ServiceLists: ", res);
        result(null, res);
    });
};


ServiceList.updateById = (id, List, result) => {

    console.log('update', List, id);

    const deliveries = JSON.stringify(List.Delivery)

    // TODO: if provider can be changed, fetch the correct provider with the provider name...

    sql.query(
        "UPDATE ServiceListOffering SET regulatorList = ?, Delivery = ? WHERE Id = ?", // Provider = ?,
        [List.regulatorList, deliveries, id], // List.Provider, 
        async (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            // remove existing related items
            await removeRelatedTables(id)

            // create new related items
            await createRelatedTables(List, id)

            console.log("updated List: ", { id: id });
            result(null, { id: id });
        }
    );
}

ServiceList.remove = async (id, result) => {
    console.log('remove', id);

    // toinen tapa, dellaa ensin referenssit - poista tää kun se cascade on taulumaarityksissa mukana
    // delete rest of the tables
    await removeRelatedTables(id)


    sql.query("DELETE FROM ServiceListOffering WHERE Id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return
        }
    
        if (res.affectedRows == 0) {
            // not found List with the id
            result({ list: "not_found" }, null);
            return
        }
        
        console.log("deleted List with id: ", id);
        result(null, res);
    });
}

ServiceList.removeAll = result => {
}



// 
// promises for getting different parts of servicelist item
//

async function createRelatedTables(list, id) {        
    let promises = []
    //console.time()

    // Create new List Name
    // TODO: update when we have more lang per name; now only saves with the first item on the languages list 
    if(list.Name) {
        promises.push(new Promise((resolve, reject) => {
            sql.query("INSERT INTO ServiceListName SET ServiceList = ?, Name = ?, lang = ?",  [id, list.Name, list.lang[0].a3], (err, res) => {
                if (err) {
                    console.log("INSERT INTO ServiceListName error: ", err);
                    reject()
                }
                //console.log("created service list NAME", res)
                resolve()
            })
        }).catch(err => {return err}) )
    }

    // Create new URI, 
    // TODO: support for several per list ? 
    if(list.URI !== undefined) {
        promises.push(new Promise((resolve, reject) => {
            sql.query("INSERT INTO ServiceListURI SET URI = ?, ServiceList = ?",  [list.URI, id], (err, res) => {
                if (err) {
                    console.log("INSERT INTO ServiceListURI error: ", err);
                    reject()
                }
                //console.log("created service list URI", res)
                resolve()
            })
        }).catch(err => {return err}) )
    }

    // Create new languages for this service list
    if(list.lang && list.lang.length) {
        for(let index in list.lang) {
            if(list.lang[index].a3 !== undefined) {
                promises.push(new Promise((resolve, reject) => {
                    sql.query("INSERT INTO Language SET Language = ?, ServiceList = ?",  [list.lang[index].a3, id], (err, res) => {
                        if (err) {
                            console.log("INSERT INTO Language error: ", err);
                            reject()
                        }
                        //console.log("created service list lang", res)
                        resolve()
                    }) 
                }).catch(err => {return err}) )
            }
        }
    }

    // Target countries
    if(list.Countries && list.Countries.length) {
        for(let index in list.Countries) {
            promises.push(new Promise((resolve, reject) => {
                sql.query("INSERT INTO TargetCountry SET Country = ?, ServiceList = ?",  [list.Countries[index].code, id], (err, res) => {
                    if (err) {
                        console.log("INSERT INTO TargetCountry error: ", err);
                        reject()
                    }
                    //console.log("created service list target country", res)
                    resolve()
                })
            }).catch(err => {return err}) )
        }
    }

    // Create genres
    if(list.Genres && list.Genres.length) {
        for(let index in list.Genres) {
            promises.push(new Promise((resolve, reject) => {
                sql.query("INSERT INTO Genre SET Genre = ?, ServiceList = ?",  [list.Genres[index].value, id], (err, res) => {
                    if (err) {
                        console.log("INSERT INTO Genre error: ", err);
                        reject()
                    }
                    //console.log("created service list Genre", res)
                    resolve()
                })
            }).catch(err => {return err}) )
        }
    }

    await Promise.all(promises).catch(err => console.log("ALL", err))

    //console.timeEnd()  // 40ms vs 13ms   
}

// part of update - clear tables before creating new rows
// 
async function removeRelatedTables(list) {
    // cycle all related tables... 
    let promises = []
    promises.push( removeAllListEntries(list, "ServiceListName").catch(err => {return err}) )
    promises.push( removeAllListEntries(list, "ServiceListURI").catch(err => {return err}) )
    promises.push( removeAllListEntries(list, "Genre").catch(err => {return err}) )
    promises.push( removeAllListEntries(list, "TargetCountry").catch(err => {
        console.log("target country failed") // debug
        return err}) )
    promises.push( removeAllListEntries(list, "Language").catch(err => {return err}) )

    await Promise.all(promises).catch(err => console.log("ALL", err))
}


// one call to fetch everything
//
async function getRestOfServiceList(list) {
    
    // Fetch provider name                
    const names = await getNames(list).catch(err => {
        console.log("getNames error: ", err)
    })
    if(names) {
        list.Provider = names[0].Name
        list.Names = names // remove ids before returning?
    }

    // fetch TargetCountries
    const countries = await getTargetCountries(list).catch(err => {
        console.log("getTargetCountries error: ", err)
    })
    
    list.targetCountries = []
    if(countries) {
        countries.forEach(pack => {
            list.targetCountries.push({country: pack.Country})
        })
    }

    // Fetch Languages
    const lang = await getLanguages(list).catch(err => {
        console.log("getLanguages error: ", err)
    })
    list.languages = []
    if(lang) {
        lang.forEach(pack => {
            list.languages.push({Language: pack.Language})
        })
    }

    // Fetch Genres
    const genre = await getGenres(list).catch(err => {
        console.log("getGenres error: ", err)
    })
    list.Genres = []
    if(genre) {
        genre.forEach(pack => {
            list.Genres.push(pack.Genre)
        })
    }

    return list
}


//
// clear tables of serviceList references
function removeAllListEntries(listId, tableName) {
    //console.log("removeAllListEntries", listId, tableName)
    return new Promise((resolve, reject) => {
        sql.query(`DELETE FROM ${tableName} where ServiceList = ${listId}`, (err, res) => {
            if (err) {
                console.log("remove error: ", err);
                reject(err)
            }
            else {          
                resolve(res)
            }
        })
    })
}

// get methods
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

 function getNames(list) {
    return new Promise((resolve, reject) => {
        // get organization for provider
         sql.query(`SELECT * FROM ProviderOffering where ProviderOffering.Id = ${list.Provider}`, (err, res) => {
             if (err) {
                 console.log("error: ", err);
                 reject(err)
             }
             else {      
                 // get organization names 
                 sql.query(`SELECT * FROM EntityName where EntityName.Organization = ${res[0].Organization}`, (err, res2) => {
                    if (err) {
                        console.log("error: ", err);
                        reject(err)
                    }
                    else {                          
                        resolve(res2)
                    }
                })   
             }
         })
    })
 }


module.exports = ServiceList;
