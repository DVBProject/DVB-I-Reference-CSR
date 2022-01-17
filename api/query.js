const qs = require('qs');
const md5 = require('md5');
const mysql = require('mysql2/promise');
const xmlbuilder = require('xmlbuilder');
const env = require('dotenv').config();
const redis = require("redis");
const countries = require("../common/countries");
const languages = require("../common/languages");
const constants = require("../common/dev_constants");

const csrquery = {}
csrquery.validParameters = [
    "TargetCountry",
    "regulatorListFlag",
    "Delivery",
    "Language",
    "Genre",
    "ProviderName"
];

csrquery.redis = null;
csrquery.mysql = null;
csrquery.init = function() {
    console.log("init csrquery");
    if(process.env.REDIS_ENABLED === "true") {
        let config = {};
        if(process.env.REDIS_HOST) {
            config.host = process.env.REDIS_HOST;
        }
        if(process.env.REDIS_PORT) {
            config.port = process.env.REDIS_PORT;
        }
        if(process.env.REDIS_PASSWORD) {
            config.password = process.env.REDIS_PASSWORD;
        }
        this.redis = redis.createClient(config);
        console.log("redis cache initialized");
    }
    this.mysql = mysql.createPool({
        connectionLimit: process.env.DB_CONNECTIONS || 10,
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || "",
        user: process.env.DB_USER || "user",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "dvb_i_csr"
    });
    console.log("DB connection pool initialized");

}

csrquery.getCSRList = async function(request) {
        const params  = qs.parse(request.query);
        var keys = Object.keys(params);
        keys.sort();
        var ordered = {};
        for (var i = 0; i < keys.length; i++) {
            ordered[keys[i]] = params[keys[i]];
        }
        //TODO Better hash function or some other way to identify the request?
        //Could we use the unhashed json as the key? or gzip the json so
        //we could check the parameters from the key
        const hash = md5(JSON.stringify(ordered));
        let cached = null;
        if(this.redis) {
            cached = await this.getCachedResponse(hash);
        }
        if(cached) {
            return cached;
        }
        else {
            const query = this.parseCSRQuery(request);
            const xml = await this.generateXML(query);
            if(this.redis) {
                this.redis.set(hash,xml);
                this.redis.expire(hash,process.env.REDIS_EXPIRES || 3600); //Default expiry, 5 minutes
            }
            return xml;
        }

}

csrquery.getCachedResponse = async function(hash) {
    try {
        return new Promise((resv, rej) => {
            this.redis.get(hash, (err, reply) => {
              resv(reply);
            });
          });
    } catch(e) {
        console.log(e);
        return false;
    }
}

csrquery.parseCSRQuery = function(request)  {
    const params  = qs.parse(request.query);

    var keys = Object.keys(params);
    keys.sort();
    var ordered = {} 
    for (var i = 0; i < keys.length; i++) {
        ordered[keys[i]] = params[keys[i]];
    }

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
    return sqlQuery;
};

csrquery.validateLanguage = function(languageParams) {
    if(!Array.isArray(languageParams)) {
        languageParams = [languageParams];
    }
    var array = [];
    for (var lang of languageParams) {
        if(!languages.hasOwnProperty(lang)) {
            throw new Error("Invalid language:"+lang);
        }
        array.push("Language.language = '" +lang+"'")
    }
    return "ServiceListOffering.Id NOT IN(SELECT ServiceList FROM Language) or ServiceListOffering.Id = Language.ServiceList and ("+array.join(" or " )+")";
}

csrquery.validateTargetCountry = function(countryParams) {
    if(!Array.isArray(countryParams)) {
        countryParams = [countryParams];
    }
    var array = [];
    for (var country of countryParams) {
        if(!countries.hasOwnProperty(country)) {
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
        if(!constants.deliveries.includes(delivery)) {
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
        if(!constants.genres.hasOwnProperty(genre)) {
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
       
        var root = xmlbuilder.create('ServiceListEntryPoints',{version: '1.0', encoding: 'UTF-8'})
            .att("xmlns","urn:dvb:metadata:servicelistdiscovery:2021" )
            .att('xmlns:mpeg7',"urn:tva:mpeg7:2008")
            .att('xmlns:dvbisd',"urn:dvb:metadata:servicediscovery:2021" )
            .att('xmlns:xsi',"http://www.w3.org/2001/XMLSchema-instance")
            .att('xsi:schemaLocation',"urn:dvb:metadata:servicelistdiscovery:2021 dvbi_service_list_discovery_v1.1.xsd");

        const registryEntity = await this.mysql.execute("SELECT Organization.* FROM ServiceListEntryPoints,Organization "
        +"WHERE ServiceListEntryPoints.Id = 1 AND ServiceListEntryPoints.ServiceListRegistryEntity = Organization.Id");
        const entityData = registryEntity[0][0];
        await this.generateOrganizationXML(entityData,true,root);
        const lists = await this.mysql.execute(query);
        var providers = {};
        for(var list of lists[0]) {
            if(!providers.hasOwnProperty(list.Provider)) {
                providers[list.Provider] = [];
            }
            providers[list.Provider].push(list.Id);   
        }
        for (var key of Object.keys(providers)) {
            await this.generateProviderXML(key,providers[key],root);
        }
        return root.end();
    } catch(e) {
        console.log(e);
        return null;
    }
}

csrquery.generateOrganizationXML = async function(organization,registryEntity,root) {
    try {
        const names =  await this.mysql.execute("SELECT * FROM EntityName WHERE Organization = "+organization.Id);
        var entity = null;
        if(registryEntity) {
            entity = root.ele("ServiceListRegistryEntity",{'regulatorFlag': (organization["Regulator"] == 1 ? "true" : "false")});
        }
        else {
            entity = root.ele("Provider",{'regulatorFlag': (organization["Regulator"] == 1 ? "true" : "false")});
        }
        for(var name of names[0]) {
            var nameElement = entity.ele("Name",{},name.Name);
            name
            if(name.Type != null && name.Type != "") {
                nameElement.att("type",name.Type);                
            }
        }
        if(organization.Jurisdiction) {
            try {
                var addressElement = entity.ele("Jurisdiction");
                this.generatePlaceType(addressElement,organization.Jurisdiction);
            }
            catch(e) {
                console.log("Invalid Jurisdiction JSON:"+organization.Address);
            }
        }
        if(organization.Address) {
            try {
                var addressElement = entity.ele("Address");
                this.generatePlaceType(addressElement,organization.Address);
            }
            catch(e) {
                console.log("Invalid Address JSON:"+organization.Address);
            }
        }
        if(organization.ElectronicAddress) {
            try {
                const electronicAddress = JSON.parse(organization.ElectronicAddress);
                let electronicAddressElement = entity.ele("ElectronicAddress");
                if(electronicAddress.Telephone) {
                    electronicAddressElement.ele("mpeg7:Telephone",{},electronicAddress.Telephone)
                }
                if(electronicAddress.Fax) {
                    electronicAddressElement.ele("mpeg7:Fax",{},electronicAddress.Fax)
                }
                if(electronicAddress.Telephone) {
                    electronicAddressElement.ele("mpeg7:Email",{},electronicAddress.Email)
                }
                if(electronicAddress.Telephone) {
                    electronicAddressElement.ele("mpeg7:Url",{},electronicAddress.Url)
                }
            }
            catch(e) {
                console.log("Invalid Electronicaddress JSON:"+organization.ElectronicAddress);
            }
        }
    } catch(e) {
        console.log(e);
    }
}

csrquery.generatePlaceType = function(root,data) {
    const address = JSON.parse(data);
    if(address.Name) {
        root.ele("mpeg7:Name",{},address.Name);
    }
    if(address.AddressLine) {
        var postalAddress = root.ele("mpeg7:PostalAddress");
        for (var Line of address.AddressLine) {
            if(Line.length > 0) {
                postalAddress.ele("mpeg7:AddressLine",{},Line);
            }
        }
    }

}

csrquery.generateProviderXML = async function(provider,lists,root) {
    try {
        const organization = await this.mysql.execute("SELECT Organization.* FROM Organization,ProviderOffering WHERE Organization.Id = ProviderOffering.Organization AND ProviderOffering.Id = "+provider);
        var providerOffering = root.ele("ProviderOffering");
        await this.generateOrganizationXML(organization[0][0],false,providerOffering);
        for(var list of lists) {
            await this.generateServiceListOfferingXML(list,providerOffering);
        }
    } catch(e) {
        console.log(e);
    }
}

csrquery.generateServiceListOfferingXML = async function(list,root) {
    var serviceListOffering = root.ele("ServiceListOffering");
    const listOffering =  await this.mysql.execute("SELECT regulatorList,Delivery FROM ServiceListOffering WHERE Id = "+list);
    if(listOffering[0][0].regulatorList == 1) {
        serviceListOffering.att("regulatorListFlag","true");
    }
    if(listOffering[0][0].Delivery) {
        var deliveries = JSON.parse(listOffering[0][0].Delivery);
        var deliveryElement = serviceListOffering.ele("Delivery");
        for(var delivery of deliveries) {
            deliveryElement.ele(delivery);
        }
    }
    const uris =  await this.mysql.execute("SELECT URI FROM ServiceListURI WHERE ServiceList = "+list);
    for(var uri of uris[0]) {
        var uriElement = serviceListOffering.ele("ServiceListURI",{"contentType":"application/xml"});
        uriElement.ele("dvbisd:URI",{},uri.URI);
    }
    const names =  await this.mysql.execute("SELECT Name,Lang FROM ServiceListName WHERE ServiceList = "+list);
    for(var name of names[0]) {
        var nameElement = serviceListOffering.ele("ServiceListName",{},name.Name);
        if(name.Lang != null && name.Lang != "") {
            nameElement.att("xml:lang",name.Lang);
        }
    }
    const languages =  await this.mysql.execute("SELECT Language FROM Language WHERE ServiceList = "+list);
    for(var language of languages[0]) {
        serviceListOffering.ele("Language",{},language.Language);
    }
    const targetcountries =  await this.mysql.execute("SELECT Country FROM TargetCountry WHERE ServiceList = "+list);
    for(var country of targetcountries[0]) {
        serviceListOffering.ele("TargetCountry",{},country.Country);
    }
    const genres =  await this.mysql.execute("SELECT Genre FROM Genre WHERE ServiceList = "+list);
    for(var genre of genres[0]) {
        serviceListOffering.ele("Genre",{href: genre.Genre});
    }

}


module.exports = csrquery;