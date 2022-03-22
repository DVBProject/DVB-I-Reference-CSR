const http = require('http');
const url = require('url');
const csrquery = require("./query");
require('dotenv').config();

const PORT = process.env.PORT || 3001;
csrquery.init();
http.createServer(async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        console.log("Options, 200 OK");
        return;
    }
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
    }
    
    var request =  url.parse(req.url,true);

    if(request.pathname && request.pathname.endsWith("/query-nocache")) {
        try {
            const list = await csrquery.getCSRList(request,false);
            res.writeHead(200);
            res.write(list);
            res.end();
            console.log('"'+req.url+'"','"'+req.headers['user-agent']+'"');
            return;
        }
        catch(e) {
            res.writeHead(400);
            res.end();
            console.log("ERROR: Illegal request",e.message);
            return;
        }
    }
    if(!request.pathname || !request.pathname.endsWith("/query")) {
        res.writeHead(400);
		res.end();
        console.log("ERROR: Wrong pathname:"+req.pathname);
        return;
    }
    try {
        const list = await csrquery.getCSRList(request,true);
        res.writeHead(200);
        res.write(list);
        res.end();
        console.log('"'+req.url+'"','"'+req.headers['user-agent']+'"');
    }
    catch(e) {
        res.writeHead(400);
		res.end();
        console.log("ERROR: Illegal request",e.message);
        return;
    }
   
}).listen(PORT, () => {
    console.log("API server is running on port "+PORT);
});