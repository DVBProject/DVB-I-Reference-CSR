const http = require('http');
const url = require('url');
const redis = require("redis");
const csrquery = require("./query");

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
    if(!request.pathname || !request.pathname.endsWith("/query")) {
        res.writeHead(400);
		res.end();
        console.log("wrong pathname:"+req.pathname);
        return;
    }
    try {
        const list = await csrquery.getCSRList(request);
        res.writeHead(200);
        res.write(list);
        res.end();
    }
    catch(e) {
        res.writeHead(400);
		res.end();
        console.log("illegal request",e.message);
        return;
    }
   
}).listen(PORT, () => {
    console.log("API server is running on port "+PORT);
});