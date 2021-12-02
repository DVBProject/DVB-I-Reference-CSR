# DVB-I-Reference-CSR

DVB-I clients, which could be anything from smartphones, tablets and laptops to TV sets, set-top boxes and USB sticks, require a means to find one or more service lists. This is referred to as service list discovery. The client may have one or more built-in or privately provisioned service list URLs or it may make use of one or more service list registries. These may be operated by, or on behalf of, various kinds of organizations such as the manufacturer of the device, a national or regional regulator, or an operator or platform brand serving only their own clients.

The specification also allows for a Central Service List Registry (CSR), operated for the benefit of all devices implementing the DVB-I client, providing information on a wide set of service lists known to that registry. A CSR could potentially play a role in kickstarting a horizontal market for DVB-I. The creation of a skeleton CSR is intended to provide the DVB Project with a means of verifying how a fully functional CSR would perform under conditions defined within the RfP.

## Technical details

The project consists of 3 modules, frontend, backend and api. 
All modules use yarn. To initialize the modules, yarn in each module directory after cloning the repository

Frontend is the WEB UI for adding and editing service lists and providers. 

Backend is used by the frontend to access the CSR database. 

API is the query API used by the DVB-I clients to access the CSR. 

SQL database is required. Database schema is found in db.sql file in the project root. Initialize the database using this sql file. 

## API and backend module configuration

Database and port configuration uses .env files.
Database  defaults are:

* database host: "localhost",
* database port: "3306",
* database user: "user",
* database password: "password",
* database name: "dvb_i_csr"

backend default port is 3000 and API default port is 3001.

To configure the values create an .env file in the api/ and backend/-directory containing the values:
```
DB_HOST=<my db address>
DB_PORT=<my db port>
DB_USER=<my db user>
DB_PASSWORD=<my db password>
DB_NAME=<my db name>
PORT=<my api/backend port>
```
Example .env file contents defining the DB host, user and password:
```
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=dbpassword
```

If a value is not defined in the .env-file, the default value is used. Port and database name can usually use the default values but they can be configured if needed.
```
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_NAME=dvb_i_csr-1
PORT=3333
```
Create the .env files to "api" and "backend" directory, respectively.

## API Module usage

After cloning the repository, install the required node modules with the command `yarn install` in the api-directory.
Start the api server with the command `node api.js` in the api-directory. Default port is 3001

API module uses a connection pool for sql connections. By default it uses 10 connections. The amount of connections can be configured in the .env file with the variable `DB_CONNECTIONS`. For example, to use a maximum of 50 connections, enter the following line to the .env file:
```
DB_CONNECTIONS=50
```

### Redis cache

The API can use redis in-memory-database to cache the responses for better performance.
To enable the redis caching, enter the following line to the .env-file:
```
REDIS_ENABLED=true
```
To configure redis host, port and password, you can use the following env variables:
```
REDIS_HOST=localhost
REDIS_PORT=34542
REDIS_PASSWORD=redispassword
```
Default values are:
* Host: localhost
* Port: 6379
* no password

## Backend Module usage

After cloning the repository, install the required node modules with the command `yarn install` in the backend-directory.
Start the backend server with the command `node server.js` in the backend-directory. Default port is 3000

## Frontend Module usage

After cloning the repository, install the required node modules with the command `yarn install` in the frontend-directory.
Start the frontend development server with the command `yarn serve` in the frontend-directory. Default port is 8081.
To build production version of the frontend, use the command `yarn build` in the frontend-directory. The production codes can be found 
in the frontend/dist-directory.

## Test server and Query API

A test server Frontend is running at https://csr.dtv.fi/
The Query API can be accessed from https://csr.dtv.fi/api/query
Example queries: 
https://csr.dtv.fi/api/query?TargetCountry=FIN 
https://csr.dtv.fi/api/query?ProviderName=Servicelist%20provider%202

Refer to https://dvb.org/wp-content/uploads/2020/11/A177r2_Service-Discovery-and-Programme-Metadata-for-DVB-I_ts_103-770-v120_June-2021.pdf chapter 5.1.3 and annex C.4.

## Issues

If you have any issue, please report them at https://github.com/DVBProject/DVB-I-Reference-CSR/issues


