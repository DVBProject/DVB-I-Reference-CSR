//
// genre parser
// 

var xml2js = require("xml2js")
var fs = require("fs")

const host1 = "raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/tva/ContentCS.xml"
const file1 = "ContentCS.xml"

const host2 = "raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/tva/FormatCS.xml"
const file2 = "FormatCS.xml"

const host3 = "raw.githubusercontent.com/paulhiggs/dvb-i-tools/main/dvbi/DVBContentSubjectCS-2019.xml"
const file3 = "DVBContentSubjectCS-2019.xml"

const hosts = [
    {h: host1, f: file1},
    {h: host2, f: file2},
    {h: host3, f: file3},
]

let finalList = []
let parsers = []
let final_xml = {}



composeJsonFromXml()


async function composeJsonFromXml() {    
    for(var i = 0; i < hosts.length; i++) {
        let element = hosts[i]
        if(element.f) {
            let parser = new xml2js.Parser({
                normalize: true,
                parseNumbers: true,
                explicitRoot: false,
            })
            parsers.push(parser)

            console.log(element)
            let data = await readFile(element.f)

            let json = await parser.parseStringPromise(data).catch(err => console.log(err))
            
            final_xml[i] = json

            let part = parseSubList("", json, true)
            part.forEach(e => {
                finalList.push(e)
            })

            console.log("parser done", element.f)
        }
        else console.log("no data for element !!")
    }

    if(finalList) writeFile("genrelist.txt", JSON.stringify(finalList))
    if(final_xml) writeFile("combinedxml.json", JSON.stringify(final_xml))
}


var cn = 0
function parseSubList(parent, data, dash = false) {
    let list_part = []
    let nameTxt = ""
    if(data.Name) {
        nameTxt = dash ? data.Name[0]._ : data.Name
        parent += nameTxt + "/"
    }
    if(data.Term) {
        element = data.Term
        element.forEach(el => {
            if(el.Term && el.Term.length) { 
                parseSubList(parent, el, dash).forEach(e => {
                    list_part.push(e)
                })
            }
            else {
                if(el.Name) {
                    let elNameTxt = dash ? el.Name[0]._ : el.Name
                    list_part.push(parent + elNameTxt)
                }

            }
            
            if(parent == "") cn++
        })
    }
    
    return list_part
}


function writeFile(filename, data) {
    fs.writeFile(filename, data, (err) => {
        if(err) {
            console.log(err, filename)
        }
        else {
            console.log("file saved: ", filename)
        }
    })
}

function readFile(filename) {
    return new Promise(function(resolve, reject) {
        let res = ""
        fs.readFile(filename, (err, data) => {
            if(err) {
                console.log(err, filename)
                reject()
            }
            else {
                console.log("file opened: ", filename)
                res = data.toString()
                resolve(res)
            }            
        })
    })
}