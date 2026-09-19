// scripts/reset-db.js
require('dotenv').config();
const DB = process.env.MONGO_DATABASE;
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || `mongodb://localhost:27017/${DB}`;

async function resetDatabase() {
    try {
        console.log(`Connecting to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri, { dbName: DB });
        console.log(`Dropping database ${DB}...`);
        await mongoose.connection.db.dropDatabase();
        console.log(`Database ${DB} dropped successfully! (Seed data will re-populate when services start)`);
    } catch (error) {
        console.error('Failed to reset database:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

resetDatabase();