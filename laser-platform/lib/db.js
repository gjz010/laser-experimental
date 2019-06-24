const { Pool } = require('pg')
const pool = new Pool({"host":"10.0.0.17", "port": 5432, "user": "postgres", "password": "postgres", "database": "postgres"});
module.exports=pool;
