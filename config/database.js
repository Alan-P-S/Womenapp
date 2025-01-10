const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'bzkd1sqpm1dxwpmqz4jw-mysql.services.clever-cloud.com',
  user: 'uba35zmofo1pfxkc',
  password: 'bcGMzeIOLfNErJYDDd8F',
  database: 'bzkd1sqpm1dxwpmqz4jw'
});

module.exports = pool.promise();
