const { Pool } = require('pg');

const pool = new Pool({
  user: 'loynis',
  host: 'localhost',
  database: 'gymDB', // to samo w docker-compose
  password: 'loynis',
  port: 5432,
});


pool.connect()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch(err => console.error('Database connection error:', err.stack));

module.exports = pool;