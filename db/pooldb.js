const { Pool } = require('pg'); 
require('dotenv').config();

const pool = new Pool({
    user: process.env.PG_USER,
    host: 'localhost',
    database: 'my_new_database',
    password: process.env.PASSWORD,
    port: 5432,
  });

module.exports = pool;