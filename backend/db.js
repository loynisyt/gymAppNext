const { Pool } = require('pg');

const pool = new Pool({
  user: 'loynis',
  host: 'localhost', // Docker Compose service name for the database
  database: 'gymDB',
  password: 'loynis',
  port: 5432,
});


pool.connect()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch(err => console.error('Database connection error:', err.stack));

module.exports = pool;