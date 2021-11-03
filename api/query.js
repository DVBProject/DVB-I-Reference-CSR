const qs = require('qs');
const md5 = require('md5');
const mysql = require('mysql2/promise');
const dbConfig = require("./db.config.js");
const xmlbuilder = require('xmlbuilder');


const csrquery = {}
csrquery.validParameters = [
    "TargetCountry",
    "regulatorListFlag",
    "Delivery",
    "Language",
    "Genre",
    "ProviderName"
];

csrquery.validLanguages = [
    "en",
    "fi",
    "sv"
];

csrquery.validCountries = [
    "AUT",
    "DEU",
    "FIN",
    "GBR",
    "USA",
    "SWE"
];

csrquery.validDeliveries = [
    "dvb-dash",
    "dvb-t",
    "dvb-c",
    "dvb-s",
    "dvb-iptv",
    "application"
];

csrquery.validGenres = [
    "dvb-dash",
    "dvb-t",
    "dvb-c",
    "dvb-s",
    "dvb-iptv",
    "application"
];

csrquery.parseCSRQuery = function(request)  {
    const params  = qs.parse(request.query);

    var keys = Object.keys(params);
    keys.sort();
    var ordered = {} 
    for (var i = 0; i < keys.length; i++) {
        ordered[keys[i]] = params[keys[i]];
    }
    //TODO better hash function than md5?
    const hash = md5(JSON.stringify(ordered));
    //TODO check redis for request content with the hash

    //Not found, validate parameters and perform SQL query.
    for (var param in params) {
        if(!this.validParameters.includes(param)) {
            throw new Error("Invalid parameter:"+param);
        }
    }
    var queryParameters = [];
    var tables = [];
    tables.push("ServiceListOffering")
    if(params.regulatorListFlag){
        if( "true" !== params.regulatorListFlag && "false" !== params.regulatorListFlag ) {
            throw new Error("Invalid regulatorListFlag:"+params.regulatorListFlag);
        }
        queryParameters.push("ServiceListOffering.regulatorList = " +( "true" == params.regulatorListFlag ? "1" : "0"));
    }
    if(params.TargetCountry) {
        queryParameters.push(this.validateTargetCountry(params.TargetCountry));
        tables.push("TargetCountry");
    }
    if(params.Language) {
        queryParameters.push(this.validateLanguage(params.Language));
        tables.push("Language");
    }
    if(params.Delivery) {
        queryParameters.push(this.validateDelivery(params.Delivery));
    }
    if(params.Genre) {
        queryParameters.push(this.validateGenres(params.Genre));
        tables.push("Genre");
    }
    if(params.ProviderName) {
        queryParameters.push(this.validateProviderName(params.ProviderName));
        tables.push("ProviderOffering");
        tables.push("Organization");
        tables.push("EntityName");
    }
    
    const sqlQuery = "Select ServiceListOffering.Id,ServiceListOffering.Provider from "+tables.join(",")+(queryParameters.length == 0 ? "" : " where "+queryParameters.join(" and "))+" Group By Id;";
    console.log(sqlQuery);
    return sqlQuery;
};

csrquery.validateLanguage = function(languages) {
    if(!Array.isArray(languages)) {
        languages = [languages];
    }
    var array = [];
    for (var lang of languages) {
        if(!this.validLanguages.includes(lang)) {
            throw new Error("Invalid language:"+lang);
        }
        array.push("Language.language = '" +lang+"'")
    }
    return "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM Language) or ServiceListOffering.Id = Language.ServiceList and ("+array.join(" or " )+")";
}

csrquery.validateTargetCountry = function(countries) {
    if(!Array.isArray(countries)) {
        countries = [countries];
    }
    var array = [];
    for (var country of countries) {
        if(!this.validCountries.includes(country)) {
            throw new Error("Invalid targetcountry:"+country);
        }
        array.push("TargetCountry.Country = '" +country+"'")
    }
    return "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM TargetCountry) or ServiceListOffering.Id = TargetCountry.ServiceList and ("+array.join(" or " )+")";
}

csrquery.validateDelivery = function(deliveries) {
    if(!Array.isArray(deliveries)) {
        deliveries = [deliveries];
    }
    var array = [];
    for (var delivery of deliveries) {
        if(!this.validDeliveries.includes(delivery)) {
            throw new Error("Invalid delivery:"+delivery);
        }
        array.push("ServiceListOffering.Delivery IS NULL OR ServiceListOffering.Delivery = '' or ServiceListOffering.Delivery LIKE '%" +delivery+"%'"); 
    }
    return "("+array.join(" or " )+")\n";
}

csrquery.validateGenres = function(genres) {
    if(!Array.isArray(genres)) {
        genres = [genres];
    }
    var array = [];
    for (var genre of genres) {
        if(!this.validGenres.includes(genre)) {
            throw new Error("Invalid genre:"+genre);
        }
        array.push("Genre.Genre = '"+genre+"'");
    }
    return "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM Genre) or ServiceListOffering.Id = Genre.ServiceList and ("+array.join(" or " )+")";
}

csrquery.validateProviderName = function(names) {
    if(!Array.isArray(names)) {
        names = [names];
    }
    var array = [];
    for (var name of names) {
        array.push("EntityName.Name = '"+name+"'"); 
    }
    return "ServiceListOffering.Provider = ProviderOffering.Id and ProviderOffering.Organization = Organization.Id and EntityName.Organization = Organization.id and("+array.join(" or " )+")";
}

csrquery.generateXML = async function(query) {
    try {
        const conn = await mysql.createConnection({
            host: dbConfig.HOST,
            user: dbConfig.USER,
            password: dbConfig.PASSWORD,
            database: dbConfig.DB
          });
        var root = xmlbuilder.create('ServiceListEntryPoints',{version: '1.0', encoding: 'UTF-8'})
            .att("xmlns","urn:dvb:metadata:servicelistdiscovery:2021" )
            .att('xmlns:mpeg7',"urn:tva:mpeg7:2008")
            .att('xmlns:dvbisd',"urn:dvb:metadata:servicediscovery:2021" )
            .att('xmlns:xsi',"http://www.w3.org/2001/XMLSchema-instance")
            .att('xsi:schemaLocation',"urn:dvb:metadata:servicelistdiscovery:2021 dvbi_service_list_discovery_v1.1.xsd");

        const registryEntity = await conn.execute("SELECT Organization.* FROM ServiceListEntryPoints,Organization "
        +"WHERE ServiceListEntryPoints.Id = 1 AND ServiceListEntryPoints.ServiceListRegistryEntity = Organization.Id");
        const entityData = registryEntity[0][0];
        await this.generateOrganizationXML(entityData,true,root,conn);
        const lists = await conn.execute(query);
        var providers = {};
        for(var list of lists[0]) {
            if(!providers.hasOwnProperty(list.Provider)) {
                providers[list.Provider] = [];
            }
            providers[list.Provider].push(list.Id);   
        }
        for (var key of Object.keys(providers)) {
            await this.generateProviderXML(key,providers[key],root,conn);
        }
        return root.end();
    } catch(e) {
        console.log(e);
    }
}

csrquery.generateOrganizationXML = async function(organization,registryEntity,root,conn) {
    try {
        const names =  await conn.execute("SELECT * FROM EntityName WHERE Organization = "+organization.Id);
        var entity = null;
        if(registryEntity) {
            entity = root.ele("ServiceListRegistryEntity",{'regulatorFlag': (organization["Regulator"] == 1 ? "true" : "false")});
        }
        else {
            entity = root.ele("Provider");
        }
        for(var name of names[0]) {
            var nameElement = entity.ele("Name",{},name.Name);
            name
            if(name.Type != null && name.Type != "") {
                nameElement.att("type",name.Type);                
            }
        }
        entity.ele("Address");
        entity.ele("ElectronicAddress");
    } catch(e) {
        console.log(e);
    }
}

csrquery.generateProviderXML = async function(provider,lists,root,conn) {
    try {
        const organization = await conn.execute("SELECT Organization.* FROM Organization,ProviderOffering WHERE Organization.Id = ProviderOffering.Organization AND ProviderOffering.Id = "+provider);
        var providerOffering = root.ele("ProviderOffering");
        await this.generateOrganizationXML(organization[0][0],false,providerOffering,conn);
        for(var list of lists) {
            await this.generateServiceListOfferingXML(list,providerOffering,conn);
        }
    } catch(e) {
        console.log(e);
    }
}

csrquery.generateServiceListOfferingXML = async function(list,root,conn) {
    var serviceListOffering = root.ele("ServiceListOffering");
    const listOffering =  await conn.execute("SELECT RegulatorList,Delivery FROM ServiceListOffering WHERE Id = "+list);
    if(listOffering.Regulator == 1) {
        serviceListOffering.att("regulatorListFlag","true");
    }
    const uris =  await conn.execute("SELECT URI FROM ServiceListURI WHERE ServiceList = "+list);
    for(var uri of uris[0]) {
        var uriElement = serviceListOffering.ele("ServiceListURI",{"contentType":"application/xml"});
        uriElement.ele("dvbisd:URI",{},uri.URI);
    }
    const names =  await conn.execute("SELECT Name,Lang FROM ServiceListName WHERE ServiceList = "+list);
    for(var name of names[0]) {
        var nameElement = serviceListOffering.ele("ServiceListName",{},name.Name);
        if(name.Lang != null && name.Lang != "") {
            nameElement.att("xml:lang",name.Lang);
        }
    }
    const languages =  await conn.execute("SELECT Language FROM Language WHERE ServiceList = "+list);
    for(var language of languages[0]) {
        serviceListOffering.ele("Language",{},language.Language);
    }
    const targetcountries =  await conn.execute("SELECT Country FROM TargetCountry WHERE ServiceList = "+list);
    for(var country of targetcountries[0]) {
        serviceListOffering.ele("TargetCountry",{},country.Country);
    }

}


module.exports = csrquery;