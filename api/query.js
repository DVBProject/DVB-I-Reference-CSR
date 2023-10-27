const qs = require("qs");
const md5 = require("md5");
const mysql = require("mysql2/promise");
const xmlbuilder = require("xmlbuilder");
const redis = require("redis");
const countries = require("../common/countries");
const languages = require("../common/languages");
const constants = require("../common/dev_constants");

const csrquery = {};
csrquery.validParameters = [
  "TargetCountry",
  "regulatorListFlag",
  "Delivery",
  "Language",
  "Genre",
  "ProviderName",
  "inlineImages",
];

csrquery.deliveryMap = {
  "dvb-dash": ["DASHDelivery"],
  "dvb-t": ["DVBTDelivery"],
  "dvb-c": ["DVBCDelivery"],
  "dvb-s": ["DVBSDelivery"],
  "dvb-iptv": ["MulticastTSDelivery", "RTSPDelivery"],
  application: ["ApplicationDelivery"],
};

csrquery.validContacNameElements = ["GivenName", "LinkingName", "FamilyName", "Title", "Salutation", "Numeration"];

csrquery.A177r3 = "a177r3";
csrquery.A177r4 = "a177r4";

csrquery.redis = null;
csrquery.mysql = null;
csrquery.init = function () {
  console.log("init csrquery");
  if (process.env.REDIS_ENABLED === "true") {
    let config = {};
    if (process.env.REDIS_HOST) {
      config.host = process.env.REDIS_HOST;
    }
    if (process.env.REDIS_PORT) {
      config.port = process.env.REDIS_PORT;
    }
    if (process.env.REDIS_PASSWORD) {
      config.password = process.env.REDIS_PASSWORD;
    }
    this.redis = redis.createClient(config);
    console.log("redis cache initialized");
  }
  this.mysql = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTIONS || 10,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "dvb_i_csr",
  });
  console.log("DB connection pool initialized");
};

csrquery.getCSRList = async function (request, useCache, version) {
  if (!version) {
    version = this.A177r4;
  }
  const params = qs.parse(request.query);
  var keys = Object.keys(params);
  keys.sort();
  var ordered = {};
  for (var i = 0; i < keys.length; i++) {
    ordered[keys[i]] = params[keys[i]];
  }
  //TODO Better hash function or some other way to identify the request?
  //Could we use the unhashed json as the key? or gzip the json so
  //we could check the parameters from the key
  const hash = md5(JSON.stringify(ordered) + version);
  let cached = null;
  if (this.redis && useCache) {
    cached = await this.getCachedResponse(hash);
  }
  if (cached) {
    return cached;
  } else {
    const query = this.parseCSRQuery(request);
    const xml = await this.generateXML(query, version);
    if (this.redis && useCache) {
      this.redis.set(hash, xml);
      this.redis.expire(hash, parseInt(process.env.REDIS_EXPIRES) || 300); //Default expiry, 5 minutes
    }
    return xml;
  }
};

csrquery.getCachedResponse = async function (hash) {
  try {
    return new Promise((resv, rej) => {
      this.redis.get(hash, (err, reply) => {
        resv(reply);
      });
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};

csrquery.parseCSRQuery = function (request) {
  const params = qs.parse(request.query);

  var keys = Object.keys(params);
  keys.sort();
  var ordered = {};
  for (var i = 0; i < keys.length; i++) {
    ordered[keys[i]] = params[keys[i]];
  }

  for (var param in params) {
    if (!this.validParameters.includes(param)) {
      throw new Error("Invalid parameter:" + param);
    }
  }
  var queryParameters = [];
  var query = [];
  var tables = [];
  var inlineImages = false;
  tables.push("ServiceListOffering");
  if (params.regulatorListFlag) {
    if ("true" !== params.regulatorListFlag && "false" !== params.regulatorListFlag) {
      throw new Error("Invalid regulatorListFlag:" + params.regulatorListFlag);
    }
    query.push("ServiceListOffering.regulatorList = " + ("true" == params.regulatorListFlag ? "1" : "0"));
  }
  if (params.TargetCountry) {
    let queryparams = this.validateTargetCountry(params.TargetCountry);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
    tables.push("TargetCountry");
  }
  if (params.Language) {
    let queryparams = this.validateLanguage(params.Language);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
    tables.push("Language");
  }
  if (params.Delivery) {
    let queryparams = this.validateDelivery(params.Delivery);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
  }
  if (params.Genre) {
    let queryparams = this.validateGenres(params.Genre);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
    tables.push("Genre");
  }
  if (params.ProviderName) {
    let queryparams = this.validateProviderName(params.ProviderName);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
    tables.push("ProviderOffering");
    tables.push("Organization");
    tables.push("EntityName");
  }
  if (params.hasOwnProperty("inlineImages")) {
    inlineImages = true;
  }
  const sqlQuery =
    "Select ServiceListOffering.Id,ServiceListOffering.Provider from " +
    tables.join(",") +
    (query.length == 0 ? "" : " where (" + query.join(" ) and (") + ")") +
    " Group By Id;";
  return [sqlQuery, queryParameters, inlineImages];
};

csrquery.validateLanguage = function (languageParams) {
  if (!Array.isArray(languageParams)) {
    languageParams = [languageParams];
  }
  var array = [];
  for (var lang of languageParams) {
    if (!languages.hasOwnProperty(lang)) {
      throw new Error("Invalid language:" + lang);
    }
    array.push(lang);
  }
  const query = Array(array.length).fill("Language.language = ?");
  return [
    "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM Language) or ServiceListOffering.Id = Language.ServiceList and (" +
      query.join(" or ") +
      ")",
    array,
  ];
};

csrquery.validateTargetCountry = function (countryParams) {
  if (!Array.isArray(countryParams)) {
    countryParams = [countryParams];
  }
  var array = [];
  for (var country of countryParams) {
    if (!countries.hasOwnProperty(country)) {
      throw new Error("Invalid targetcountry:" + country);
    }
    array.push(country);
  }
  const query = Array(array.length).fill("TargetCountry.Country = ?");
  return [
    "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM TargetCountry) or ServiceListOffering.Id = TargetCountry.ServiceList and (" +
      query.join(" or ") +
      ")",
    array,
  ];
};

csrquery.validateDelivery = function (deliveries) {
  if (!Array.isArray(deliveries)) {
    deliveries = [deliveries];
  }
  var array = [];
  for (var delivery of deliveries) {
    const validDeliveryparams = Object.keys(this.deliveryMap);
    if (!validDeliveryparams.includes(delivery)) {
      throw new Error("Invalid delivery:" + delivery);
    }
    let deliveryValues = this.deliveryMap[delivery];
    for (var value of deliveryValues) {
      array.push("%" + value + "%");
    }
  }
  const query = Array(array.length).fill("ServiceListOffering.Delivery LIKE ?");
  return ["(" + query.join(" or ") + ")", array];
};

csrquery.validateGenres = function (genres) {
  if (!Array.isArray(genres)) {
    genres = [genres];
  }
  var array = [];
  for (var genre of genres) {
    if (!constants.genres.hasOwnProperty(genre)) {
      throw new Error("Invalid genre:" + genre);
    }
    array.push(genre);
  }
  const query = Array(array.length).fill("Genre.Genre = ?");
  return [
    "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM Genre) or ServiceListOffering.Id = Genre.ServiceList and (" +
      query.join(" or ") +
      ")",
    array,
  ];
};

csrquery.validateProviderName = function (names) {
  if (!Array.isArray(names)) {
    names = [names];
  }
  var array = [];
  for (var name of names) {
    array.push(name);
  }
  const query = Array(array.length).fill("EntityName.Name = ?");
  return [
    "ServiceListOffering.Provider = ProviderOffering.Id and ProviderOffering.Organization = Organization.Id and EntityName.Organization = Organization.id and(" +
      query.join(" or ") +
      ")",
    array,
  ];
};

csrquery.generateXML = async function (query, version) {
  try {
    //A177r4 schema is the default
    var xmlns = "urn:dvb:metadata:servicelistdiscovery:2022b";
    var xmlns_dvbisd = "urn:dvb:metadata:servicediscovery:2022b";
    var schemaLocation = "urn:dvb:metadata:servicelistdiscovery:2022 dvbi_service_list_discovery_v1.4.xsd";
    if (version == this.A177r3) {
      xmlns = "urn:dvb:metadata:servicelistdiscovery:2022";
      xmlns_dvbisd = "urn:dvb:metadata:servicediscovery:2022";
      schemaLocation = "urn:dvb:metadata:servicelistdiscovery:2022 dvbi_service_list_discovery_v1.3.xsd";
    }
    const lang = await this.mysql.execute(
      "SELECT Language FROM ServiceListEntryPoints WHERE ServiceListEntryPoints.Id = 1"
    );
    var root = xmlbuilder
      .create("ServiceListEntryPoints", { version: "1.0", encoding: "UTF-8" })
      .att("xmlns", xmlns)
      .att("xmlns:mpeg7", "urn:tva:mpeg7:2008")
      .att("xmlns:dvbisd", xmlns_dvbisd)
      .att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
      .att("xsi:schemaLocation", schemaLocation)
      .att("xml:lang", lang[0][0].Language);

    const registryEntity = await this.mysql.execute(
      "SELECT Organization.* FROM ServiceListEntryPoints,Organization " +
        "WHERE ServiceListEntryPoints.Id = 1 AND ServiceListEntryPoints.ServiceListRegistryEntity = Organization.Id"
    );
    const entityData = registryEntity[0][0];
    await this.generateOrganizationXML(entityData, true, root, query[2]);
    const lists = await this.mysql.execute(query[0], query[1]);
    var providers = {};
    for (var list of lists[0]) {
      if (!providers.hasOwnProperty(list.Provider)) {
        providers[list.Provider] = [];
      }
      providers[list.Provider].push(list.Id);
    }
    for (var key of Object.keys(providers)) {
      await this.generateProviderXML(key, providers[key], root, query[2]);
    }
    return root.end();
  } catch (e) {
    console.log(e);
    return null;
  }
};

csrquery.generateOrganizationXML = async function (organization, registryEntity, root, inlineImages) {
  try {
    const names = await this.mysql.execute("SELECT * FROM EntityName WHERE Organization = ?", [organization.Id]);
    var entity = null;
    if (registryEntity) {
      entity = root.ele("ServiceListRegistryEntity", {
        regulatorFlag: organization["Regulator"] == 1 ? "true" : "false",
      });
    } else {
      entity = root.ele("Provider", { regulatorFlag: organization["Regulator"] == 1 ? "true" : "false" });
    }
    if (organization.Icons) {
      try {
        const icons = JSON.parse(organization.Icons);
        if (Array.isArray(icons)) {
          for (const icon of icons) {
            if (icon.content && icon.type) {
              if (icon.type == "MediaUri") {
                let iconElement = entity.ele("mpeg7:Icon");
                iconElement.ele("mpeg7:MediaUri", {}, icon.content);
              } else if (inlineImages && icon.type == "MediaData16" && icon.mimeType) {
                let iconElement = entity.ele("mpeg7:Icon");
                let inline = iconElement.ele("mpeg7:InlineMedia", { type: icon.mimeType });
                inline.ele("mpeg7:MediaData16", {}, icon.content);
              } else if (inlineImages && icon.type == "MediaData64" && icon.mimeType) {
                let iconElement = entity.ele("mpeg7:Icon");
                let inline = iconElement.ele("mpeg7:InlineMedia", { type: icon.mimeType });
                inline.ele("mpeg7:MediaData16", {}, icon.content);
              }
            }
          }
        }
      } catch (e) {
        console.log("Invalid Icon JSON:" + organization.Icons);
      }
    }
    for (var name of names[0]) {
      var nameElement = entity.ele("Name", {}, name.Name);
      name;
      if (name.Type != null && name.Type != "") {
        nameElement.att("type", name.Type);
      }
    }
    if (organization.Kind && organization.Kind.length > 0) {
      const kinds = JSON.parse(organization.Kind);
      if (Array.isArray(kinds) && kinds.length > 0) {
        var kindElement = entity.ele("Kind");
        for (const kind of kinds) {
          if (kind.name) {
            var element = kindElement.ele("mpeg7:Name", {}, kind.name);
            if (kind.lang) {
              element.att("xml:lang", kind.lang);
            }
          }
          if (kind.definition) {
            var element = kindElement.ele("mpeg7:Definition", {}, kind.definition);
            if (kind.lang) {
              element.att("xml:lang", kind.lang);
            }
          }
        }
      }
    }
    if (organization.ContactName) {
      try {
        const names = JSON.parse(organization.ContactName);
        if (Array.isArray(names)) {
          if (names.length > 0) {
            var contact = entity.ele("ContactName");
            for (var name of names) {
              if (this.validContacNameElements.includes(name.type)) {
                contact.ele("mpeg7:" + name.type, {}, name.name);
              } else {
                console.log("Invalid ContactName element type:" + name.type);
              }
            }
          }
        } else {
          throw new Error("ContactName not an array");
        }
      } catch (e) {
        console.log("Invalid ContactName JSON:" + organization.ContactName);
      }
    }
    if (organization.Jurisdiction) {
      try {
        this.generatePlaceType(entity, organization.Jurisdiction, "Jurisdiction");
      } catch (e) {
        console.log("Invalid Jurisdiction JSON:" + organization.Address);
      }
    }
    if (organization.Address) {
      try {
        this.generatePlaceType(entity, organization.Address, "Address");
      } catch (e) {
        console.log(e, "Invalid Address JSON:" + organization.Address);
      }
    }
    if (organization.ElectronicAddress) {
      try {
        const electronicAddress = JSON.parse(organization.ElectronicAddress);
        let electronicAddressElement = null;
        if (electronicAddress.Telephone) {
          if (electronicAddressElement == null) {
            electronicAddressElement = entity.ele("ElectronicAddress");
          }
          electronicAddressElement.ele("mpeg7:Telephone", {}, electronicAddress.Telephone);
        }
        if (electronicAddress.Fax) {
          if (electronicAddressElement == null) {
            electronicAddressElement = entity.ele("ElectronicAddress");
          }
          electronicAddressElement.ele("mpeg7:Fax", {}, electronicAddress.Fax);
        }
        if (electronicAddress.Email) {
          if (electronicAddressElement == null) {
            electronicAddressElement = entity.ele("ElectronicAddress");
          }
          electronicAddressElement.ele("mpeg7:Email", {}, electronicAddress.Email);
        }
        if (electronicAddress.Url) {
          if (electronicAddressElement == null) {
            electronicAddressElement = entity.ele("ElectronicAddress");
          }
          electronicAddressElement.ele("mpeg7:Url", {}, electronicAddress.Url);
        }
      } catch (e) {
        console.log("Invalid Electronicaddress JSON:" + organization.ElectronicAddress);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

csrquery.generatePlaceType = function (parent, data, elementName) {
  var root = null;
  const address = JSON.parse(data);
  if (address.Name) {
    root = parent.ele(elementName);
    root.ele("mpeg7:Name", {}, address.Name);
  }
  if (address.AddressLine) {
    var postalAddress = null;
    for (var Line of address.AddressLine) {
      if (Line.length > 0) {
        if (root == null) {
          root = parent.ele(elementName);
        }
        if (postalAddress == null) {
          postalAddress = root.ele("mpeg7:PostalAddress");
        }
        postalAddress.ele("mpeg7:AddressLine", {}, Line);
      }
    }
  }
};

csrquery.generateProviderXML = async function (provider, lists, root, inlineImages) {
  try {
    const organization = await this.mysql.execute(
      "SELECT Organization.* FROM Organization,ProviderOffering WHERE Organization.Id = ProviderOffering.Organization AND ProviderOffering.Id = ?",
      [provider]
    );
    var providerOffering = root.ele("ProviderOffering");
    await this.generateOrganizationXML(organization[0][0], false, providerOffering, inlineImages);
    for (var list of lists) {
      await this.generateServiceListOfferingXML(list, providerOffering);
    }
  } catch (e) {
    console.log(e);
  }
};

csrquery.generateServiceListOfferingXML = async function (list, root) {
  var serviceListOffering = root.ele("ServiceListOffering");
  const listOffering = await this.mysql.execute("SELECT regulatorList,Delivery FROM ServiceListOffering WHERE Id = ?", [
    list,
  ]);
  if (listOffering[0][0].regulatorList == 1) {
    serviceListOffering.att("regulatorListFlag", "true");
  }
  const names = await this.mysql.execute("SELECT Name,Lang FROM ServiceListName WHERE ServiceList = ?", [list]);
  for (var name of names[0]) {
    var nameElement = serviceListOffering.ele("ServiceListName", {}, name.Name);
    if (name.Lang != null && name.Lang != "") {
      nameElement.att("xml:lang", name.Lang);
    }
  }
  const uris = await this.mysql.execute("SELECT URI FROM ServiceListURI WHERE ServiceList = ?", [list]);
  for (var uri of uris[0]) {
    var uriElement = serviceListOffering.ele("ServiceListURI", { contentType: "application/xml" });
    uriElement.ele("dvbisd:URI", {}, uri.URI);
  }
  if (listOffering[0][0].Delivery) {
    try {
      var deliveries = JSON.parse(listOffering[0][0].Delivery);
      if (typeof deliveries === "object" && !Array.isArray(deliveries)) {
        var deliveryElement = serviceListOffering.ele("Delivery");
        var keys = Object.keys(deliveries);
        for (var key of constants.deliveries) {
          if (deliveries[key]) {
            var delivery = deliveryElement.ele(key);
            if (key === "DVBSDelivery") {
              if (deliveries[key]["required"] === true) {
                delivery.att("required", true);
              }
              console.log(deliveries[key]);
              if (deliveries[key]["OrbitalPosition"] && Array.isArray(deliveries[key]["OrbitalPosition"])) {
                for (var position of deliveries[key]["OrbitalPosition"]) {
                  console.log(position);
                  delivery.ele("OrbitalPosition", {}, position);
                }
              }
            } else if (key === "ApplicationDelivery") {
              if (deliveries[key]["required"] === true) {
                delivery.att("required", true);
              }
              if (deliveries[key]["ApplicationTypes"] && Array.isArray(deliveries[key]["ApplicationTypes"])) {
                for (var apptype of deliveries[key]["ApplicationTypes"]) {
                  console.log(apptype);
                  var typeElement = delivery.ele("ApplicationType");
                  typeElement.att("contentType", apptype["contentType"]);
                  if (apptype["xmlAitApplicationType"]) {
                    typeElement.att("xmlAitApplicationType", apptype["xmlAitApplicationType"]);
                  }
                }
              }
            } else {
              var attributes = Object.keys(deliveries[key]);
              for (var attribute of attributes) {
                const value = deliveries[key][attribute];
                if (value) {
                  delivery.att(attribute, value);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  const languages = await this.mysql.execute("SELECT Language FROM Language WHERE ServiceList = ?", [list]);
  for (var language of languages[0]) {
    serviceListOffering.ele("Language", {}, language.Language);
  }
  const genres = await this.mysql.execute("SELECT Genre FROM Genre WHERE ServiceList = ?", [list]);
  for (var genre of genres[0]) {
    serviceListOffering.ele("Genre", { href: genre.Genre });
  }
  const targetcountries = await this.mysql.execute("SELECT Country FROM TargetCountry WHERE ServiceList = ?", [list]);
  for (var country of targetcountries[0]) {
    serviceListOffering.ele("TargetCountry", {}, country.Country);
  }
};

module.exports = csrquery;
