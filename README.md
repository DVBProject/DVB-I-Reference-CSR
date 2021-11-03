The project consists of 3 modules, frontend, backend and api. 
All modules use yarn. To initialize the modules, yarn in each module directory after cloning the repository

Frontend is the WEB UI for adding and editing service lists and providers. Runs in port 8081.Started with the command yarn serve

Backend is used by the frontend to access the CSR database. Runs in port 3000. Started with the command node server.js

API is the query API used by the DVB-I clients to access the CSR. Runs in port 3001. Started with the command api.js

SQL database is required. Database configuration is in the db.config.js file in the project root. Database schema is found in db.sql file in the project root
