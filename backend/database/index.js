const mysql = require('mysql2/promise');
const colors = require('colors');
const moment = require('moment');
 
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

const pool = mysql.createPool(config);

const query = async (queryString, params, response) => {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`${now} -- ${colors.rainbow(queryString)}`);
    console.log(queryString);

    let connection;
    try {
        connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(queryString, params);
            connection.release();
            return rows
        } catch (e) {
            console.error('Query Error');
            console.error(e);
            if (connection) connection.release();
            if (response) {
                return response.status(500).json({ code: 'Query Error' });
            } else {
                throw e;
            }
        }
    } catch (e) {
        console.error('DB Error');
        console.error(e);
        if (connection) connection.release();
        if (response) {
            return response.status(500).json({ code: 'DB Error' });
        } else {
            throw e;
        }
    }
};

module.exports = { config, pool, query };