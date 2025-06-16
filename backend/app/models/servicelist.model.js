const { log } = require("../../logging.js");
const sql = require("./db.js");

// constructor
const ServiceList = function (serviceList) {
  this.Names = serviceList.Names;
  this.languages = serviceList.languages;
  this.URI = serviceList.URI;
  this.Provider = serviceList.Provider;
  this.ProviderId = serviceList.ProviderId;
  this.regulatorList = serviceList.regulatorList;
  this.Delivery = serviceList.Delivery;
  this.targetCountries = serviceList.targetCountries;
  this.Genres = serviceList.Genres;
  this.Status = serviceList.Status;
  this.ServiceListId = serviceList.ServiceListId;
  this.Icons = serviceList.Icons || [];
};

ServiceList.create = (newServiceList, result) => {
  // verify needed data is not missing
  if (
    !newServiceList.Names ||
    !Array.isArray(newServiceList.Names) ||
    newServiceList.Names.length == 0
  ) {
    result({ msg: "Name required!" }, null);
    return;
  }
  if (
    !newServiceList.ServiceListId ||
    newServiceList.ServiceListId.length == 0
  ) {
    result({ msg: "Service list ID required!" }, null);
    return;
  }
  for (const Name of newServiceList.Names) {
    if (Name.name == "") {
      result({ msg: "Name cannot be empty!" }, null);
      return;
    }
  }
  if (
    !newServiceList.URI ||
    !Array.isArray(newServiceList.URI) ||
    newServiceList.URI.length == 0
  ) {
    result({ msg: "URI required!" }, null);
    return;
  }
  for (const URI of newServiceList.URI) {
    if (URI == "") {
      result({ msg: "URI required!" }, null);
      return;
    }
  }

  if (!newServiceList.languages || newServiceList.languages.length < 1)
    newServiceList.languages = [];
  newServiceList.URI = newServiceList.URI || [""];
  if (!newServiceList.Delivery || newServiceList.Delivery.length < 1)
    newServiceList.Delivery = { DASHDelivery: {} };

  const test = new RegExp("^[0-9]+$");
  if (
    newServiceList.Delivery.DVBCDelivery &&
    !test.test(newServiceList.Delivery.DVBCDelivery.networkID)
  ) {
    result({ msg: "Invalid DVB-C Delivery network id!" }, null);
    return;
  }
  if (
    newServiceList.Delivery.DVBCDelivery &&
    parseInt(newServiceList.Delivery.DVBCDelivery.networkID) > 65535
  ) {
    result(
      { msg: "Invalid DVB-C Delivery network id, maximum value 65535" },
      null
    );
    return;
  }
  if (
    newServiceList.Delivery.DVBSDelivery &&
    newServiceList.Delivery.DVBSDelivery.OrbitalPosition
  ) {
    if (Array.isArray(newServiceList.Delivery.DVBSDelivery.OrbitalPosition)) {
      for (const position of newServiceList.Delivery.DVBSDelivery
        .OrbitalPosition) {
        if (!validateOrbitalPosition(position)) {
          result(
            {
              msg: "Invalid DVB-S orbital position, values between -180 and 180 are allowed",
            },
            null
          );
        }
      }
    }
  }
  if (
    newServiceList.Delivery.DVBCDelivery &&
    parseInt(newServiceList.Delivery.DVBCDelivery.networkID) > 65535
  ) {
    result(
      { msg: "Invalid DVB-C Delivery network id, maximum value 65535" },
      null
    );
    return;
  }
  const deliverylist = Object.keys(newServiceList.Delivery);
  for (const delivery of deliverylist) {
    if (
      newServiceList.Delivery[delivery].minimumBitRate &&
      !test.test(newServiceList.Delivery[delivery].minimumBitRate)
    ) {
      result({ msg: "Invalid " + delivery + " mimium bit rate!" }, null);
      return;
    }
    if (
      newServiceList.Delivery[delivery].minimumBitRate &&
      parseInt(newServiceList.Delivery[delivery].minimumBitRate) > 4294967295
    ) {
      result(
        {
          msg:
            "Invalid " +
            delivery +
            " mimium bit rate, maximum value 4294967295",
        },
        null
      );
      return;
    }
  }
  const deliveries = JSON.stringify(newServiceList.Delivery);
  if (!Array.isArray(newServiceList.Icons)) {
    result({ msg: "Invalid service list icons" }, null);
    return;
  }
  const icons = JSON.stringify(newServiceList.Icons);

  sql.query(
    "INSERT INTO ServiceListOffering SET Provider = ?, regulatorList = ?, Delivery = ?,Status = ?,ServiceListId = ?, Icons = ?, updatedUtc = utc_timestamp()",
    [
      newServiceList.ProviderId,
      newServiceList.regulatorList,
      deliveries,
      newServiceList.Status,
      newServiceList.ServiceListId,
      icons,
    ],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }
      // create all related items
      await createRelatedTables(newServiceList, res.insertId);

      result(null, { id: res.insertId, ...newServiceList });
    }
  );
};

ServiceList.findById = (ListId, result) => {
  sql.query(
    `SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc FROM ServiceListOffering WHERE ServiceListOffering.Id = ?`,
    [ListId],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      if (res.length) {
        res[0].Delivery = JSON.parse(res[0].Delivery);
        res[0].Icons = JSON.parse(
          res[0]?.Icons?.length > 0 ? res[0].Icons : "[]"
        );
        let list = res[0];
        // fetch all the rest of relevant DB tables
        list.ProviderId = list.Provider;
        await getRestOfServiceList(list);
        result(null, res[0]);
        return;
      }

      // not found List with the id
      result({ Name: "not_found" }, null);
    }
  );
};

ServiceList.findByUniqueId = (ListId, result) => {
  sql.query(
    `SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc  FROM ServiceListOffering WHERE ServiceListOffering.ServiceListId = ?`,
    [ListId],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      if (res.length) {
        res[0].Delivery = JSON.parse(res[0].Delivery);
        res[0].Icons = JSON.parse(
          res[0]?.Icons?.length > 0 ? res[0].Icons : "[]"
        );
        let list = res[0];
        // fetch all the rest of relevant DB tables
        list.ProviderId = list.Provider;
        await getRestOfServiceList(list);
        result(null, res[0]);
        return;
      }

      // not found List with the id
      result({ Name: "not_found" }, null);
    }
  );
};

// internal, to check list provider ownership when user updates lists
ServiceList.listHeaderById = (ListId) => {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT ServiceListOffering.Id, ServiceListOffering.Provider FROM ServiceListOffering WHERE ServiceListOffering.Id = ? `,
      [ListId],
      async (err, res) => {
        if (err) {
          log(err);
          reject(err);
          return;
        }

        if (res.length) {
          resolve(res[0]);
          return;
        }

        // not found List with the id
        reject({ Name: "not_found" });
      }
    );
  });
};

ServiceList.getAllByStatus = async (
  result,
  liststatus = "active",
  provider = null
) => {
  let query = "";
  // using query params
  if (provider)
    query = `SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc  FROM ServiceListOffering WHERE ServiceListOffering.Status = ? AND ServiceListOffering.Provider = ?`;
  else
    query = `SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc  FROM ServiceListOffering WHERE ServiceListOffering.Status = ?`;
  sql.query(query, [liststatus, provider], async (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    let promises = [];
    try {
      for (let i = 0; i < res.length; i++) {
        let list = res[i];
        res[i].Delivery = JSON.parse(res[i].Delivery);
        res[i].Icons = JSON.parse(
          res[i]?.Icons?.length > 0 ? res[i].Icons : "[]"
        );
        // fetch all the rest of relevant DB tables
        promises.push(
          new Promise(async (resolve, reject) => {
            await getRestOfServiceList(list);
            resolve();
          })
        );
      }
    } catch (err) {
      log(err);
      result(null, err);
      return;
    }

    await Promise.all(promises).catch((err) => log(err));
    result(null, res);
  });
};

ServiceList.getAllByProvider = async (provider, result) => {
  sql.query(
    `SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc  FROM ServiceListOffering where ServiceListOffering.Provider = ?`,
    [provider],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      let promises = [];
      try {
        for (let i = 0; i < res.length; i++) {
          let list = res[i];
          res[i].Delivery = JSON.parse(res[i].Delivery);
          res[i].Icons = JSON.parse(
            res[i]?.Icons?.length > 0 ? res[i].Icons : "[]"
          );
          promises.push(
            new Promise(async (resolve, reject) => {
              await getRestOfServiceList(list);
              resolve();
            })
          );
        }
      } catch (err) {
        log(err);
        result(err, null);
        return;
      }

      await Promise.all(promises).catch((err) => log(err));

      result(null, res);
    }
  );
};

ServiceList.getAll = async (result) => {
  sql.query(
    "SELECT ServiceListOffering.Id,ServiceListOffering.Provider,ServiceListOffering.Delivery,ServiceListOffering.Icons, ServiceListOffering.Status, ServiceListOffering.regulatorList,ServiceListOffering.ServiceListId,ServiceListOffering.updatedUtc  FROM ServiceListOffering ORDER BY ServiceListOffering.Id",
    async (err, res) => {
      if (err) {
        log(err);
        result(null, err);
        return;
      }
      let promises = [];
      try {
        for (let i = 0; i < res.length; i++) {
          let list = res[i];
          res[i].Delivery = JSON.parse(res[i].Delivery);
          res[i].Icons = JSON.parse(
            res[i]?.Icons?.length > 0 ? res[i].Icons : "[]"
          );
          // fetch all the rest of relevant DB tables
          promises.push(
            new Promise(async (resolve, reject) => {
              await getRestOfServiceList(list);
              resolve();
            })
          );
        }
      } catch (err) {
        log(err);
        result(null, err);
        return;
      }

      await Promise.all(promises).catch((err) => log(err));
      result(null, res);
    }
  );
};

// when deleting all providers, must delete all related lists too
ServiceList.getAllProviderServiceListOfferings = async (providerId, result) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT * FROM ServiceListOffering where Provider = ?",
      providerId,
      async (err, res) => {
        if (err) {
          log(err);
          reject(err);
          return;
        }

        resolve(res);
      }
    );
  });
};

ServiceList.updateById = (id, List, result) => {
  // verify needed data is not missing
  if (!List.Names || !Array.isArray(List.Names) || List.Names.length == 0) {
    result({ msg: "Name required!" }, null);
    return;
  }
  for (const listName of List.Names) {
    if (listName.name == "") {
      result({ msg: "Name cannot be empty!" }, null);
      return;
    }
  }
  if (!List.URI || !Array.isArray(List.URI) || List.URI.length == 0) {
    result({ msg: "URI required!" }, null);
    return;
  }
  for (const URI of List.URI) {
    if (URI == "") {
      result({ msg: "URI required!" }, null);
      return;
    }
  }
  // verify needed data is not missing
  if (!List.languages || List.languages.length < 1) List.languages = [];
  if (!List.Delivery || List.Delivery.length < 1)
    List.Delivery = { DASHDelivery: {} };
  List.Status = List.Status || "";
  const test = new RegExp("^[0-9]+$");
  if (
    List.Delivery.DVBCDelivery &&
    !test.test(List.Delivery.DVBCDelivery.networkID)
  ) {
    result({ msg: "Invalid DVB-C Delivery network id!" }, null);
    return;
  }
  if (
    List.Delivery.DVBCDelivery &&
    parseInt(List.Delivery.DVBCDelivery.networkID) > 65535
  ) {
    result(
      { msg: "Invalid DVB-C Delivery network id, maximum value 65535" },
      null
    );
    return;
  }
  if (
    List.Delivery.DVBSDelivery &&
    List.Delivery.DVBSDelivery.OrbitalPosition
  ) {
    if (Array.isArray(List.Delivery.DVBSDelivery.OrbitalPosition)) {
      for (const position of List.Delivery.DVBSDelivery.OrbitalPosition) {
        if (!validateOrbitalPosition(position)) {
          result(
            {
              msg: "Invalid DVB-S orbital position, values between -180 and 180 are allowed",
            },
            null
          );
        }
      }
    }
  }
  if (
    List.Delivery.DVBCDelivery &&
    parseInt(List.Delivery.DVBCDelivery.networkID) > 65535
  ) {
    result(
      { msg: "Invalid DVB-C Delivery network id, maximum value 65535" },
      null
    );
    return;
  }
  const deliverylist = Object.keys(List.Delivery);
  for (const delivery of deliverylist) {
    if (
      List.Delivery[delivery].minimumBitRate &&
      !test.test(List.Delivery[delivery].minimumBitRate)
    ) {
      result({ msg: "Invalid " + delivery + " mimium bit rate!" }, null);
      return;
    }
    if (
      List.Delivery[delivery].minimumBitRate &&
      parseInt(List.Delivery[delivery].minimumBitRate) > 4294967295
    ) {
      result(
        {
          msg:
            "Invalid " +
            delivery +
            " mimium bit rate, maximum value 4294967295",
        },
        null
      );
      return;
    }
  }
  let deliveries = { DASHDelivery: {} };

  try {
    deliveries = JSON.stringify(List.Delivery);
  } catch (err) {
    deliveries = JSON.stringify({ DASHDelivery: {} });
    log(err);
  }
  let icons = "[]";
  try {
    if (List.Icons && Array.isArray(List.Icons)) {
      icons = JSON.stringify(List.Icons);
    }
  } catch (err) {
    log(err);
  }
  console.log("icons", icons);
  sql.query(
    "UPDATE ServiceListOffering SET regulatorList = ?, Provider = ?, Status = ?, Delivery = ?,Icons = ?,ServiceListId = ?, updatedUtc = utc_timestamp() WHERE Id = ? ",
    [
      List.regulatorList,
      List.ProviderId,
      List.Status,
      deliveries,
      icons,
      List.ServiceListId,
      id,
    ],
    async (err, res) => {
      if (err) {
        log(err);
        result(err, null);
        return;
      }

      // remove existing related items
      await removeRelatedTables(id);

      // create new related items
      await createRelatedTables(List, id);
      result(null, { id: id });
    }
  );
};

ServiceList.remove = async (id, result) => {
  // delete rest of the tables
  await removeRelatedTables(id);

  sql.query("DELETE FROM ServiceListOffering WHERE Id = ?", id, (err, res) => {
    if (err) {
      log(err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      // not found List with the id
      result({ list: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

async function createRelatedTables(list, id) {
  let promises = [];
  // Create new List Names / name language
  if (list.Names) {
    for (let i = 0; i < list.Names.length; i++) {
      // instead of promise.all, wait one by one to preserve the name ordering
      if (list.Names[i].name) {
        await new Promise((resolve, reject) => {
          sql.query(
            "INSERT INTO ServiceListName SET ServiceList = ?, Name = ?, lang = ?",
            [id, list.Names[i].name, list.Names[i].lang ?? ""],
            (err, res) => {
              if (err) {
                log(err);
                reject();
              }
              resolve();
            }
          );
        }).catch((err) => {
          log(err);
        });
      }
    }
  }

  // Create new URI,
  // TODO: support for several per list ?
  if (list.URI !== undefined) {
    for (let i = 0; i < list.URI.length; i++) {
      promises.push(
        new Promise((resolve, reject) => {
          sql.query(
            "INSERT INTO ServiceListURI SET URI = ?, ServiceList = ?",
            [list.URI[i], id],
            (err, res) => {
              if (err) {
                log(err);
                reject();
              }
              resolve();
            }
          );
        }).catch((err) => {
          log(err);
        })
      );
    }
  }

  // Create new languages for this service list
  if (list.languages && list.languages.length) {
    for (let index in list.languages) {
      if (list.languages[index].Language !== undefined) {
        promises.push(
          new Promise((resolve, reject) => {
            sql.query(
              "INSERT INTO Language SET Language = ?, ServiceList = ?",
              [list.languages[index].Language, id],
              (err, res) => {
                if (err) {
                  log(err);
                  reject();
                }
                resolve();
              }
            );
          }).catch((err) => {
            log(err);
          })
        );
      }
    }
  }

  // Target countries
  if (list.targetCountries && list.targetCountries.length) {
    for (let index in list.targetCountries) {
      promises.push(
        new Promise((resolve, reject) => {
          sql.query(
            "INSERT INTO TargetCountry SET Country = ?, ServiceList = ?",
            [list.targetCountries[index].country, id],
            (err, res) => {
              if (err) {
                log(err);
                reject();
              }
              resolve();
            }
          );
        }).catch((err) => {
          log(err);
        })
      );
    }
  }

  // Create genres
  if (list.Genres && list.Genres.length > 0) {
    for (let index in list.Genres) {
      promises.push(
        new Promise((resolve, reject) => {
          sql.query(
            "INSERT INTO Genre SET Genre = ?, ServiceList = ?",
            [list.Genres[index].value, id],
            (err, res) => {
              if (err) {
                log(err);
                reject();
              }
              resolve();
            }
          );
        }).catch((err) => {
          log(err);
        })
      );
    }
  }

  await Promise.all(promises).catch((err) => log(err));
}

// part of update - clear tables before creating new rows
async function removeRelatedTables(list) {
  // cycle all related tables...
  let promises = [];
  promises.push(
    removeAllListEntries(list, "ServiceListName").catch((err) => {
      log(err);
    })
  );
  promises.push(
    removeAllListEntries(list, "ServiceListURI").catch((err) => {
      log(err);
    })
  );
  promises.push(
    removeAllListEntries(list, "Genre").catch((err) => {
      log(err);
    })
  );
  promises.push(
    removeAllListEntries(list, "TargetCountry").catch((err) => {
      log(err);
    })
  );
  promises.push(
    removeAllListEntries(list, "Language").catch((err) => {
      log(err);
    })
  );

  await Promise.all(promises).catch((err) => log(err));
}

// one call to fetch everything
async function getRestOfServiceList(list) {
  // Fetch provider name
  const pnames = await getProviderNames(list).catch((err) => {
    log(err);
  });
  if (pnames) {
    list.Provider = pnames[0].Name;
    //list.ProviderNames = pnames
  }

  // fetch list names / langs
  list.Names = [];

  const names = await getNames(list).catch((err) => {
    log(err);
  });
  if (names && names.length) {
    list.Names = names;
  }
  list.URI = [];

  const uris = await getURI(list).catch((err) => {
    log(err);
  });
  if (uris && uris.length) {
    list.URI = uris;
  }

  // fetch TargetCountries
  const countries = await getTargetCountries(list).catch((err) => {
    log(err);
  });

  list.targetCountries = [];
  if (countries) {
    countries.forEach((pack) => {
      list.targetCountries.push({ country: pack.Country });
    });
  }

  // Fetch Languages
  const lang = await getLanguages(list).catch((err) => {
    log(err);
  });
  list.languages = [];
  if (lang) {
    lang.forEach((pack) => {
      list.languages.push({ Language: pack.Language });
    });
  }

  // Fetch Genres
  const genre = await getGenres(list).catch((err) => {
    log(err);
  });
  list.Genres = [];
  if (genre) {
    genre.forEach((pack) => {
      list.Genres.push({ value: pack.Genre });
    });
  }

  return list;
}

// clear tables of serviceList references
function removeAllListEntries(listId, tableName) {
  return new Promise((resolve, reject) => {
    sql.query(
      `DELETE FROM ${tableName} where ServiceList = ${listId}`,
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

// get methods
function getTargetCountries(list) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM TargetCountry where TargetCountry.ServiceList = ?`,
      [list.Id],
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

function getLanguages(list) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM Language where Language.ServiceList = ?`,
      [list.Id],
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

function getGenres(list) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM Genre where Genre.ServiceList = ?`,
      [list.Id],
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

function getNames(list) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM ServiceListName where ServiceListName.ServiceList = ?`,
      [list.Id],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          let response = [];
          res.forEach((item) => {
            response.push({ name: item.Name, lang: item.Lang });
          });
          resolve(response);
        }
      }
    );
  });
}

function getURI(list) {
  return new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM ServiceListURI where ServiceListURI.ServiceList = ?`,
      [list.Id],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          let response = [];
          res.forEach((item) => {
            response.push(item.URI);
          });
          resolve(response);
        }
      }
    );
  });
}

function getProviderNames(list) {
  return new Promise((resolve, reject) => {
    // get organization for provider
    sql.query(
      `SELECT * FROM ProviderOffering where ProviderOffering.Id = ?`,
      [list.Provider],
      (err, res) => {
        if (err) {
          log(err);
          reject(err);
        } else {
          // get organization names
          sql.query(
            `SELECT * FROM EntityName where EntityName.Organization = ?`,
            [res[0].Organization],
            (err, res2) => {
              if (err) {
                log(err);
                reject(err);
              } else {
                resolve(res2);
              }
            }
          );
        }
      }
    );
  });
}

ServiceList.findByURI = (url) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT ServiceListOffering.Id FROM ServiceListURI,ServiceListOffering where ServiceListURI.URI = ? and ServiceListURI.ServiceList = ServiceListOffering.Id",
      [url],
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

function validateOrbitalPosition(value) {
  const pos = Number(value);
  if (value && !isNaN(pos) && pos >= -180 && pos <= 180) {
    return true;
  }
  return false;
}

module.exports = ServiceList;
