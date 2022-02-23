const sql = require("./db.js");

// constructor
const ServiceList = function(serviceList) {
    this.Names = serviceList.Names
    this.lang = serviceList.lang
    this.URI = serviceList.URI
    this.Provider = serviceList.Provider
    this.regulatorList = serviceList.regulatorList
    this.Delivery = serviceList.Delivery
    this.Countries = serviceList.Countries
    this.Genres = serviceList.Genres
    this.Status = serviceList.Status
}


ServiceList.create = (newServiceList, result) => {

    // verify needed data is not missing
    if(!newServiceList.Names || newServiceList.Names.length == 0) {
        result({msg:"Name required!"}, null);
        return;
    }
    for(var Name in newServiceList.Names) {
        if(Name == "") {
            result({msg:"Name required!"}, null);
            return;
        }
    }
    if(!newServiceList.URI) {
        result({msg:"URI required!"}, null);
        return;
    }
    if( !newServiceList.lang || newServiceList.lang.length < 1) newServiceList.lang = []
    newServiceList.URI = newServiceList.URI || ""
    if(!newServiceList.Delivery || newServiceList.Delivery.length < 1) newServiceList.Delivery = ["DASHDelivery"]

    const deliveries = JSON.stringify(newServiceList.Delivery)

    sql.query("INSERT INTO ServiceListOffering SET Provider = ?, regulatorList = ?, Delivery = ?,Status = ?", [ newServiceList.Provider, newServiceList.regulatorList, deliveries, newServiceList.Status ], async (err, res) => {
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
    sql.query(`SELECT ServiceListOffering.Id,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.Status, ServiceListOffering.regulatorList FROM ServiceListURI,ServiceListOffering WHERE ServiceListOffering.Id = ? AND ServiceListURI.ServiceList = ServiceListOffering.Id`, 
       [ListId], async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
    
        if (res.length) {  
            let list = res[0]            
            // fetch all the rest of relevant DB tables
            list.ProviderId = list.Provider
            list = await getRestOfServiceList(list)          
            result(null, res[0]);
            return;
        }
    
        // not found List with the id
        result({ Name: "not_found" }, null);
    });
};

// internal, to check list provider ownership when user updates lists
// 
ServiceList.listHeaderById = (ListId) => {
    return new Promise((resolve, reject) => {
        sql.query(`SELECT ServiceListOffering.Id, ServiceListOffering.Provider FROM ServiceListOffering WHERE ServiceListOffering.Id = ? `, 
        [ListId], async (err, res) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
                return;
            }
        
            if (res.length) {                    
                resolve(res[0]);
                return;
            }
            
            // not found List with the id
            reject({ Name: "not_found" });
        });
    })
};


// 
//
ServiceList.getAllByStatus = async (result, liststatus = 'active', provider = null) => {
    let query = ''
    // using query params
    if (provider) query = `SELECT ServiceListOffering.Id,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.Status, ServiceListOffering.regulatorList FROM ServiceListURI,ServiceListOffering WHERE ServiceListOffering.Status = ? AND ServiceListOffering.Provider = ? AND ServiceListURI.ServiceList = ServiceListOffering.Id`
    else query = `SELECT ServiceListOffering.Id,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.Status, ServiceListOffering.regulatorList FROM ServiceListURI,ServiceListOffering WHERE ServiceListOffering.Status = ? AND ServiceListURI.ServiceList = ServiceListOffering.Id`
    sql.query(query, [liststatus, provider], async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
    
        let promises = []
        //console.time("getStatus")
        try {
            for(i = 0; i < res.length; i++) {
                let list = res[i]                
                // fetch all the rest of relevant DB tables
                //list = await getRestOfServiceList(list)
                promises.push(new Promise(async (resolve, reject) => {
                    list = await getRestOfServiceList(list)
                    resolve()
                }))
            }
        } catch(err) {
            console.log("error: ", err)
            result(null, err);
            return;
        }

        await Promise.all(promises).catch(err => console.log("getStatus err", err))
        //console.timeEnd("getStatus")
        //console.log("ServiceLists: ", res);
        result(null, res);
    })
}

ServiceList.getAllByProvider = async (provider, result) => {
    
    sql.query(`SELECT ServiceListOffering.Id,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.Status, ServiceListOffering.regulatorList FROM ServiceListURI,ServiceListOffering where ServiceListOffering.Provider = ? AND ServiceListURI.ServiceList = ServiceListOffering.Id`, [provider], async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        let promises = []
        
        try {
            for(i = 0; i < res.length; i++) {
                let list = res[i]                
                
                promises.push(new Promise(async (resolve, reject) => {
                    list = await getRestOfServiceList(list)
                    resolve()
                }))
            }
        } catch(err) {
            console.log("error: ", err)
            result(err, null);
            return;
        }

        await Promise.all(promises).catch(err => console.log("getAllByProvider err", err))
        
        result(null, res);
    })
}


ServiceList.getAll = async result => {
    //sql.query("SELECT ServiceListOffering.Id,ServiceListName.Name,ServiceListName.lang,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.regulatorList FROM ServiceListName,ServiceListURI,ServiceListOffering where ServiceListName.ServiceList = ServiceListOffering.Id AND ServiceListURI.ServiceList = ServiceListOffering.Id", async (err, res) => {
    sql.query("SELECT ServiceListOffering.Id,ServiceListURI.URI,ServiceListOffering.Provider,ServiceListOffering.Delivery, ServiceListOffering.Status, ServiceListOffering.regulatorList FROM ServiceListURI,ServiceListOffering where ServiceListURI.ServiceList = ServiceListOffering.Id ORDER BY ServiceListOffering.Id", 
      async (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        let promises = []
        //console.time("getAll")
        try {
            for(i = 0; i < res.length; i++) {
                let list = res[i]                
                // fetch all the rest of relevant DB tables
                //list = await getRestOfServiceList(list)
                promises.push(new Promise(async (resolve, reject) => {
                    list = await getRestOfServiceList(list)
                    resolve()
                }))
            }
        } catch(err) {
            console.log("error: ", err)
            result(null, err);
            return;
        }

        await Promise.all(promises).catch(err => console.log("getAll err", err))
        //console.timeEnd("getAll")
        //console.log("ServiceLists: ", res);
        result(null, res);
    });
};

// when deleting all providers, must delete all related lists too
//
ServiceList.getAllProviderServiceListOfferings = async (providerId, result) => {
    return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM ServiceListOffering where Provider = ?", providerId, async (err, res) => {
            if (err) {
                console.log("error: ", err)
                reject(err)
                return
            }

            resolve(res)
        })
    })
}


ServiceList.updateById = (id, List, result) => {

    console.log('update', List, id);
    // verify needed data is not missing
    if(!List.Names || List.Names.length == 0) {
        result({msg: "Name required!"}, null);
        return;
    }
    for(var Name in List.Names) {
        if(Name == "") {
            result({msg: "Name required!"}, null);
            return;
        }
    }
    if(!List.URI) {
        result({msg: "Service list URI required!"}, null);
        return;
    }
    // verify needed data is not missing
    if( !List.lang || List.lang.length < 1) List.lang = []
    if(!List.Delivery || List.Delivery.length < 1) List.Delivery = ["DASHDelivery"]
    List.Status = List.Status || ""

    let deliveries =  ["DASHDelivery"]
    try {
        deliveries = JSON.stringify(List.Delivery)
    } catch {
        console.log("updateById: possible corrupt query", req.user)
    }

    sql.query(
        "UPDATE ServiceListOffering SET regulatorList = ?, Status = ?, Delivery = ? WHERE Id = ?",
        [List.regulatorList, List.Status, deliveries, id], 
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
    console.log('remove List', id);

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


//
//
ServiceList.removeAll = result => {
}



// 
// promises for getting different parts of servicelist item
//

async function createRelatedTables(list, id) {
    console.log("create related", id)

    let promises = []
    //console.time()

    // Create new List Names / name language
    console.log("names:", list.Names)
    if(list.Names) {
        for(var i = 0; i < list.Names.length; i++) {
            //console.log("create name")
            // instead of promise.all, wait one by one to preserve the name ordering
            if(list.Names[i].name) {
                await new Promise((resolve, reject) => {
                    sql.query("INSERT INTO ServiceListName SET ServiceList = ?, Name = ?, lang = ?",  [id, list.Names[i].name, list.Names[i].lang], (err, res) => {
                        if (err) {
                            console.log("INSERT INTO ServiceListName error: ", err);
                            reject()
                        }
                        resolve()
                    })
                }).catch(err => {
                    console.log("createRelatedTables name", err)
                })
            }
        }
    }

    // Create new URI, 
    // TODO: support for several per list ? 
    if(list.URI !== undefined) {
        //console.log("create uri")
        promises.push(new Promise((resolve, reject) => {
            sql.query("INSERT INTO ServiceListURI SET URI = ?, ServiceList = ?",  [list.URI, id], (err, res) => {
                if (err) {
                    console.log("INSERT INTO ServiceListURI error: ", err)
                    reject()
                }
                //console.log("created service list URI", res)
                resolve()
            })
        }).catch(err => {
            console.log("createRelatedTables URI", err)
            //return err
            }) 
        )
            
    }

    // Create new languages for this service list
    if(list.lang && list.lang.length) {
        //console.log("create lang")
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
                }).catch(err => {
                    console.log("createRelatedTables lang", err)
                    //return err
                }) )
            }
        }
    }

    // Target countries
    if(list.Countries && list.Countries.length) {
        //console.log("create countries")
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
            }).catch(err => {
                console.log("createRelatedTables country", err)
                //return err
            }) )
        }
    }

    // Create genres
    if(list.Genres && list.Genres.length) {
        //console.log("create genres")
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
            }).catch(err => {
                console.log("createRelatedTables genres", err)
                //return err
            }) )
        }
    }

    await Promise.all(promises).catch(err => console.log("createRelatedTables ALL", err))

    //console.timeEnd()  // 40ms vs 13ms   
}

// part of update - clear tables before creating new rows
// 
async function removeRelatedTables(list) {
    console.log("remove related", list)
    // cycle all related tables... 
    let promises = []
    promises.push( removeAllListEntries(list, "ServiceListName").catch(err => {console.log("ServiceListName failed") }) )
    promises.push( removeAllListEntries(list, "ServiceListURI").catch(err => {console.log("ServiceListURI failed") }) )
    promises.push( removeAllListEntries(list, "Genre").catch(err => {console.log("Genre failed") }) )
    promises.push( removeAllListEntries(list, "TargetCountry").catch(err => {
        console.log("target country failed") // debug
        //return err
    }) )
    promises.push( removeAllListEntries(list, "Language").catch(err => {console.log("Language failed") }) )

    await Promise.all(promises).catch(err => console.log("ALL", err))
}


// one call to fetch everything
//
async function getRestOfServiceList(list) {
    
    // Fetch provider name                
    const pnames = await getProviderNames(list).catch(err => {
        console.log("getProviderNames error: ", err)
    })
    if(pnames) {        
        list.Provider = pnames[0].Name
        //list.ProviderNames = pnames 
    }

    // fetch list names / langs
    list.Names = []

    const names = await getNames(list).catch(err => {
        console.log("getNames error: ", err)
    })
    if(names && names.length) {
        list.Names = names
    }
    else {
        console.log("no names found for list", list.Id)        
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
        sql.query(`SELECT * FROM TargetCountry where TargetCountry.ServiceList = ?`, [list.Id], (err, res) => {
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
         sql.query(`SELECT * FROM Language where Language.ServiceList = ?`, [list.Id], (err, res) => {
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
         sql.query(`SELECT * FROM Genre where Genre.ServiceList = ?`, [list.Id], (err, res) => {
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
         sql.query(`SELECT * FROM ServiceListName where ServiceListName.ServiceList = ?`, [list.Id], (err, res) => {
             if (err) {
                 console.log("error: ", err);
                 reject(err)
             }
             else {
                 let response = []
                 res.forEach(item => {
                     response.push({name: item.Name, lang: item.Lang})
                 })        
                 resolve(response)
             }
         })
    })
 }

 function getProviderNames(list) {
    return new Promise((resolve, reject) => {
        // get organization for provider
         sql.query(`SELECT * FROM ProviderOffering where ProviderOffering.Id = ?`, [list.Provider], (err, res) => {
             if (err) {
                 console.log("error: ", err);
                 reject(err)
             }
             else {      
                 // get organization names 
                 sql.query(`SELECT * FROM EntityName where EntityName.Organization = ?`, [res[0].Organization], (err, res2) => {
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
