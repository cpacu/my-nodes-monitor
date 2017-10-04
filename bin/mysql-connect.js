var mysql = require("mysql");

/* Creating POOL MySQL connection.*/
var pool = mysql.createPool({
    connectionLimit   :   100,
    host              :   'localhost',
    user              :   'monitor', 
    password          :   'password',
    database          :   'sensordata',
    debug             :   false
});

module.exports = pool;
