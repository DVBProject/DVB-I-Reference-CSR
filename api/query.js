const xmlbuilder = require('xmlbuilder')
const {countries} = require( "../common/countries.js")
const {languages} = require("../common/languages.js");
const  { genres, deliveries} = require("../common/dev_constants.js");
const { log } = require('./logging.js');

const csrquery = {};
csrquery.validParameters = [
  "TargetCountry",
  "regulatorListFlag",
  "Delivery",
  "Language",
  "Genre",
  "ProviderName",
  "inlineImages",
  "ServicelistId"
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

csrquery.A177r6 = "a177r6";

csrquery.mysql = null;
csrquery.init = function (db) {
 this.mysql = db;
};

csrquery.parseCSRQuery = function (params)  {
  for (const param in params) {
    if (!this.validParameters.includes(param)) {
      throw new Error("Invalid parameter:" + param);
    }
  }
  const queryParameters = [];
  const query = [];
  const tables = [];
  let inlineImages = false;
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
  if (params.ServicelistId) {
    let queryparams = this.parseServiceListId(params.ServicelistId);
    query.push(queryparams[0]);
    queryParameters.push(...queryparams[1]);
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
  const array = [];
  for (const lang of languageParams) {
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

csrquery.parseServiceListId = function (serviceListParams) {
  if (!Array.isArray(serviceListParams)) {
    serviceListParams = [serviceListParams];
  }

  const query = Array(serviceListParams.length).fill("ServiceListOffering.ServiceListId = ?");
  return [
    "(" +
      query.join(" or ") +
      ")",
    serviceListParams,
  ];
}

csrquery.validateTargetCountry = function (countryParams) {
  if (!Array.isArray(countryParams)) {
    countryParams = [countryParams];
  }
  const array = [];
  for (const country of countryParams) {
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
  const array = [];
  for (const delivery of deliveries) {
    const validDeliveryparams = Object.keys(this.deliveryMap);
    if (!validDeliveryparams.includes(delivery)) {
      throw new Error("Invalid delivery:" + delivery);
    }
    let deliveryValues = this.deliveryMap[delivery];
    for (const value of deliveryValues) {
      array.push("%" + value + "%");
    }
  }
  const query = Array(array.length).fill("ServiceListOffering.Delivery LIKE ?");
  return ["(" + query.join(" or ") + ")", array];
};

csrquery.validateGenres = function (genreList) {
  if (!Array.isArray(genreList)) {
    genreList = [genreList];
  }
  const array = [];
  for (const genre of genreList) {
    if (!genres.hasOwnProperty(genre)) {
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
  const array = [];
  for (const name of names) {
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


csrquery.generateXML = async function (params,version) {
  const query = this.parseCSRQuery(params);
  try {
    //A177r6 schema is the default
    const xmlns = "urn:dvb:metadata:servicelistdiscovery:2024";
    const xmlns_dvbisd = "urn:dvb:metadata:servicediscovery:2024";
    const schemaLocation = "urn:dvb:metadata:servicelistdiscovery:2022 dvbi_service_list_discovery_v1.6.xsd";
    const lang = await this.execute(
      "SELECT Language FROM ServiceListEntryPoints WHERE ServiceListEntryPoints.Id = 1"
    );
    const root = xmlbuilder
      .create("ServiceListEntryPoints", { version: "1.0", encoding: "UTF-8" })
      .att("xmlns", xmlns)
      .att("xmlns:mpeg7", "urn:tva:mpeg7:2008")
      .att("xmlns:tva", "urn:tva:metadata:2024")
      .att("xmlns:dvbisd", xmlns_dvbisd)
      .att("xmlns:dvbi-types","urn:dvb:metadata:servicediscovery-types:2023" )
      .att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
      .att("xsi:schemaLocation", schemaLocation)
      .att("xml:lang", lang[0].Language);

    const registryEntity = await this.execute(
      "SELECT Organization.* FROM ServiceListEntryPoints,Organization " +
        "WHERE ServiceListEntryPoints.Id = 1 AND ServiceListEntryPoints.ServiceListRegistryEntity = Organization.Id"
    );
    const entityData = registryEntity[0];
    await this.generateOrganizationXML(entityData, true, root, query[2]);
    const lists = await this.execute(query[0], query[1]);
    const providers = {};
    for (const list of lists) {
      if (!providers.hasOwnProperty(list.Provider)) {
        providers[list.Provider] = [];
      }
      providers[list.Provider].push(list.Id);
    }
    let lastModified = null;
    for (const key of Object.keys(providers)) {
      const modified = await this.generateProviderXML(key, providers[key], root, query[2]);
      if(lastModified == null || lastModified < modified) {
        lastModified = modified;
      }
    }
    return {xml: root.end(), lastModified: lastModified} ;
  } catch (e) {
    log(e);
    return null;
  }
};

csrquery.generateOrganizationXML = async function (organization, registryEntity, root, inlineImages) {
  try {
    const names = await this.execute("SELECT * FROM EntityName WHERE Organization = ?", [organization.Id]);
    let entity = null;
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
                inline.ele("mpeg7:MediaData64", {}, icon.content);
              }
            }
          }
        }
      } catch (e) {
        log("Invalid Icon JSON:" + organization.Icons);
      }
    }
    for (const name of names) {
      const nameElement = entity.ele("Name", {}, name.Name);
      if (name.Type != null && name.Type != "") {
        nameElement.att("type", name.Type);
      }
    }
    if (organization.Kind && organization.Kind.length > 0) {
      const kinds = JSON.parse(organization.Kind);
      if (Array.isArray(kinds) && kinds.length > 0) {
        const kindElement = entity.ele("Kind");
        for (const kind of kinds) {
          if (kind.name) {
            const element = kindElement.ele("mpeg7:Name", {}, kind.name);
            if (kind.lang) {
              element.att("xml:lang", kind.lang);
            }
          }
          if (kind.definition) {
            const element = kindElement.ele("mpeg7:Definition", {}, kind.definition);
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
            const contact = entity.ele("ContactName");
            for (const name of names) {
              if (this.validContacNameElements.includes(name.type)) {
                contact.ele("mpeg7:" + name.type, {}, name.name);
              } else {
                log("Invalid ContactName element type:" + name.type);
              }
            }
          }
        } else {
          throw new Error("ContactName not an array");
        }
      } catch (e) {
        log("Invalid ContactName JSON:" + organization.ContactName);
      }
    }
    if (organization.Jurisdiction) {
      try {
        this.generatePlaceType(entity, organization.Jurisdiction, "Jurisdiction");
      } catch (e) {
        log("Invalid Jurisdiction JSON:" + organization.Address);
      }
    }
    if (organization.Address) {
      try {
        this.generatePlaceType(entity, organization.Address, "Address");
      } catch (e) {
        log(e, "Invalid Address JSON:" + organization.Address);
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
        log("Invalid Electronicaddress JSON:" + organization.ElectronicAddress);
      }
    }
  } catch (e) {
    log(e);
  }
};

csrquery.generatePlaceType = function (parent, data, elementName) {
  let root = null;
  const address = JSON.parse(data);
  if (address.Name) {
    root = parent.ele(elementName);
    root.ele("mpeg7:Name", {}, address.Name);
  }
  if (address.AddressLine) {
    let postalAddress = null;
    for (const Line of address.AddressLine) {
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
    const organization = await this.execute(
      "SELECT Organization.*,ProviderOffering.updatedUtc FROM Organization,ProviderOffering WHERE Organization.Id = ProviderOffering.Organization AND ProviderOffering.Id = ?",
      [provider]
    );
    let lastModified = organization[0].updatedUtc
    const providerOffering = root.ele("ProviderOffering");
    await this.generateOrganizationXML(organization[0], false, providerOffering, inlineImages);
    for (const list of lists) {
      let modified = await this.generateServiceListOfferingXML(list, providerOffering);
      if(lastModified < modified) {
        lastModified = modified;
      }
    }
    return lastModified
  } catch (e) {
    log(e);
  }
};

csrquery.generateServiceListOfferingXML = async function (list, root) {
  const serviceListOffering = root.ele("ServiceListOffering");
  const listOffering = await this.execute("SELECT regulatorList,Delivery,Icons,ServicelistId,updatedUtc FROM ServiceListOffering WHERE Id = ?", [
    list,
  ]);
  if (listOffering[0].regulatorList == 1) {
    serviceListOffering.att("regulatorListFlag", "true");
  }
  const names = await this.execute("SELECT Name,Lang FROM ServiceListName WHERE ServiceList = ?", [list]);
  for (const name of names) {
    const nameElement = serviceListOffering.ele("dvbi-types:ServiceListName", {}, name.Name);
    if (name.Lang != null && name.Lang != "") {
      nameElement.att("xml:lang", name.Lang);
    }
  }
  const uris = await this.execute("SELECT URI FROM ServiceListURI WHERE ServiceList = ?", [list]);
  for (const uri of uris) {
    const uriElement = serviceListOffering.ele("dvbi-types:ServiceListURI", { contentType: "application/xml" });
    uriElement.ele("dvbi-types:URI", {}, uri.URI);
  }
  if (listOffering[0].Delivery) {
    try {
      const deliveryList = JSON.parse(listOffering[0].Delivery);
      if (typeof deliveryList === "object" && !Array.isArray(deliveryList)) {
        const deliveryElement = serviceListOffering.ele("dvbi-types:Delivery");
        for (const key of deliveries) {
          if (deliveryList[key]) {
            const delivery = deliveryElement.ele("dvbi-types:"+key);
            if (key === "DVBSDelivery") {
              if (deliveryList[key]["required"] === true) {
                delivery.att("required", true);
              }
              if (deliveryList[key]["OrbitalPosition"] && Array.isArray(deliveryList[key]["OrbitalPosition"])) {
                for (const position of deliveryList[key]["OrbitalPosition"]) {
                  delivery.ele("dvbi-types:OrbitalPosition", {}, position);
                }
              }
            } else if (key === "ApplicationDelivery") {
              if (deliveryList[key]["required"] === true) {
                delivery.att("required", true);
              }
              if (deliveryList[key]["ApplicationTypes"] && Array.isArray(deliveryList[key]["ApplicationTypes"])) {
                for (const apptype of deliveryList[key]["ApplicationTypes"]) {
                  const typeElement = delivery.ele("dvbi-types:ApplicationType");
                  typeElement.att("contentType", apptype["contentType"]);
                  if (apptype["xmlAitApplicationType"]) {
                    typeElement.att("xmlAitApplicationType", apptype["xmlAitApplicationType"]);
                  }
                }
              }
            } else {
              const attributes = Object.keys(deliveryList[key]);
              for (const attribute of attributes) {
                const value = deliveryList[key][attribute];
                if (value) {
                  delivery.att(attribute, value);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      log(e);
    }
  }
  const languages = await this.execute("SELECT Language FROM Language WHERE ServiceList = ?", [list]);
  for (const language of languages) {
    serviceListOffering.ele("dvbi-types:Language", {}, language.Language);
  }
  const genres = await this.execute("SELECT Genre FROM Genre WHERE ServiceList = ?", [list]);
  for (const genre of genres) {
    serviceListOffering.ele("dvbi-types:Genre", { href: genre.Genre });
  }
  const targetcountries = await this.execute("SELECT Country FROM TargetCountry WHERE ServiceList = ?", [list]);
  for (const country of targetcountries) {
    serviceListOffering.ele("dvbi-types:TargetCountry", {}, country.Country);
  }
  if (listOffering[0].Icons) {
    try {
      const iconList = JSON.parse(listOffering[0].Icons);
      if (typeof iconList === "object" && Array.isArray(iconList) && iconList.length > 0) {
        const deliveryElement = serviceListOffering.ele("dvbi-types:RelatedMaterial");
        deliveryElement.ele("tva:HowRelated",{href : "urn:dvb:metadata:cs:HowRelatedCS:2021:1001.1"})
        for (const icon of iconList) {
          const mediaLocator = deliveryElement.ele("tva:MediaLocator")
          if(icon.type == "MediaUri") {
             mediaLocator.ele("tva:MediaUri", { contentType: icon.mimeType}, icon.content )
          }
          if(icon.type == "MediaData16") {
             const inline = mediaLocator.ele("tva:InlineMedia", { type: icon.mimeType} )
             inline.ele("mpeg7:MediaData16",{},icon.content)
          }
          if(icon.type == "MediaData64") {
             const inline = mediaLocator.ele("tva:InlineMedia", { type: icon.mimeType} )
             inline.ele("mpeg7:MediaData64",{},icon.content)
          }
        }
      }
    } catch (e) {
      log(e);
    }
  }
  serviceListOffering.ele("dvbi-types:ServiceListId",{},listOffering[0].ServicelistId);
  return listOffering[0].updatedUtc
};

csrquery.execute = function(...query) {
  return new Promise((resolve, reject) => {
      this.mysql.query(...query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
} 


module.exports = { csrquery }
