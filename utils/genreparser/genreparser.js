const { DOMParser } = require('@xmldom/xmldom');
const fs = require("fs")
const genres = [
    "https://raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/tva/ContentCS.xml",
    "https://raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/tva/FormatCS.xml",
    "https://raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/dvbi/DVBContentSubjectCS-2019.xml",
];



const getXML = (url) => {
    return new Promise((resolve, reject) => {
        const https = require('https');
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(data);
            });

        }).on("error", (err) => {
            reject(err);
        });
    });
};

async function readGenres() {
    let genrelist = {};
    for(const genre of genres) {
        let data = await getXML(genre);
        const parser = new DOMParser();
        const doc = parser.parseFromString(data,"text/xml");
        const uri = doc.documentElement.getAttribute("uri");
        const terms = doc.documentElement.getElementsByTagName("Term");
        for(var i = 0;i < terms.length;i++) {
            let term = terms[i]
            let id = term.getAttribute("termID");
            let name = null;
            for(var j = 0; j < term.childNodes.length; j++)
            {
                if(term.childNodes[j].nodeType == 1 && term.childNodes[j].tagName == "Name") {
                    name = term.childNodes[j].childNodes[0].nodeValue;
                }
            }    
            genrelist[uri+"."+id] = name;
        }
    }
    writeFile("genres.json", JSON.stringify(genrelist));
    console.log(genrelist);
}

function writeFile(filename, data) {
    fs.writeFile(filename, data, (err) => {
        if(err) {
            console.log(err, filename)
        }
        else {
            console.log("file saved: ", filename)
             }
    }); 
}
readGenres();