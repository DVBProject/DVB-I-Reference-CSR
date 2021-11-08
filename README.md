# DVB-I-Reference-CSR

DVB-I clients, which could be anything from smartphones, tablets and laptops to TV sets, set-top boxes and USB sticks, require a means to find one or more service lists. This is referred to as service list discovery. The client may have one or more built-in or privately provisioned service list URLs or it may make use of one or more service list registries. These may be operated by, or on behalf of, various kinds of organizations such as the manufacturer of the device, a national or regional regulator, or an operator or platform brand serving only their own clients.

The specification also allows for a Central Service List Registry (CSR), operated for the benefit of all devices implementing the DVB-I client, providing information on a wide set of service lists known to that registry. A CSR could potentially play a role in kickstarting a horizontal market for DVB-I. The creation of a skeleton CSR is intended to provide the DVB Project with a means of verifying how a fully functional CSR would perform under conditions defined within the RfP.

## Technical details

The project consists of 3 modules, frontend, backend and api. 
All modules use yarn. To initialize the modules, yarn in each module directory after cloning the repository

Frontend is the WEB UI for adding and editing service lists and providers. 

Backend is used by the frontend to access the CSR database. 

API is the query API used by the DVB-I clients to access the CSR. 

SQL database is required. Database configuration is in the db.config.js file in the project root. Database schema is found in db.sql file in the project root

## How to use

Frontend runs in port 8081.Started with the command yarn serve

Backend runs in port 3000. Started with the command node server.js

API runs in port 3001 by default. Started with the command api.js

## API Configuration

Database and port configuration uses .env files.
API module defaults are:
* database host: "localhost",
* database user: "user",
* database password: "password",
* database name: "dvb_i_csr"
* port: 3001

To configure the values create an .env file in the api/-directory containing the values:
```
DB_HOST=<my db address>
DB_USER=<my db user>
DB_PASSWORD=<my db password>
DB_NAME=<my db name>
PORT=<my api port>
```

## How to contribute

## contact: 


