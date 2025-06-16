const  http = require("http");
const  url = require("url");
const  qs = require("qs");
const  md5 = require("md5");
const csrquery = require("./query.js").csrquery;
require('dotenv').config()
const  redis = require("redis");
const mysql = require("mysql2");

const PORT = process.env.PORT || 3001;
const { error, info } = require("./logging");

process.on("uncaughtException", (err) => {
  error(err)
});

let redisClient = null;

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
  redisClient = redis.createClient(config);
  info("redis cache initialized");
}

const mysqlClient = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTIONS || 10,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "password",
    database:  process.env.DB_NAME || "dvb_i_csr",
    timezone: "Z",
  });
  info("DB connection pool initialized");


csrquery.init(mysqlClient);
http
  .createServer(async function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }
    if (req.url === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }

    var request = url.parse(req.url, true);

    if (request.pathname) {
      if (request.pathname.endsWith("/query")|| request.pathname.endsWith("/query-nocache")) {
        try {
          const useCache = request.pathname.endsWith("/query-nocache")
          const params = qs.parse(request.query);
          const keys = Object.keys(params);
          keys.sort((a, b) => {
            return a.localeCompare(b, 'en', { sensitivity: 'base' });
          });
          //TODO Better hash function or some other way to identify the request?
          //Could we use the unhashed json as the key? or gzip the json so
          //we could check the parameters from the key
          const hash = md5(JSON.stringify(keys) + csrquery.A177r6);
          let xml = null;
          if (redisClient && useCache) {
            xml = await getCachedResponse(hash);
          }

          if (!xml) {
            xml = await csrquery.generateXML(params, csrquery.A177r6);
            if (redisClient && useCache) {
              redisClient.set(hash, xml);
              redisClient.expire(hash, parseInt(process.env.REDIS_EXPIRES) || 300); //Default expiry, 5 minutes
            }
          }
          if(xml.lastModified) {
            res.appendHeader('Last-Modified',xml.lastModified.toUTCString() )
          }
          res.writeHead(200, { "Content-Type": "application/xml"  });
          res.write(xml.xml);
          res.end();
          info('"' + req.url + '"', '"' + req.headers["user-agent"] + '"');
          return;
        } catch (e) {
          res.writeHead(400);
          res.end();
          info(e);
          return;
        }
      }
    }
    else {
      res.writeHead(400);
      res.end();
      info("ERROR: Wrong pathname:" + req.pathname);
    }
    return;
  })
  .listen(PORT, () => {
    info("API server is running on port " + PORT);
  });


  async function getCachedResponse(hash) {
    try {
      return new Promise((resv, rej) => {
        redisClient.get(hash, (err, reply) => {
          resv(reply);
        });
      });
    } catch (e) {
      info(e);
      return false;
    }
  };