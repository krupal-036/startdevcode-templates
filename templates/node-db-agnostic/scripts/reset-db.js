// scripts/reset-db.js
require('dotenv').config();
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

async function resetMongo() {
    const mongoose = require('mongoose');
    const DB = process.env.DB_NAME;
    const uri = process.env.MONGO_URI || `mongodb://localhost:27017/${DB}`;
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { dbName: DB });
    console.log(`Dropping database ${DB}...`);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    console.log(`Database ${DB} dropped successfully!`);
}

async function resetMysql() {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    });
    const db = process.env.MYSQL_DATABASE;
    console.log(`Dropping MySQL database ${db}...`);
    await conn.query(`DROP DATABASE IF EXISTS \`${db}\``);
    await conn.query(`CREATE DATABASE \`${db}\``);
    await conn.end();
    console.log(`MySQL database ${db} re-created successfully!`);
}

(async () => {
    try {
        if (DB_TYPE === 'mysql') await resetMysql();
        else await resetMongo();
    } catch (error) {
        console.error('Failed to reset database:', error.message);
        process.exit(1);
    }
})();