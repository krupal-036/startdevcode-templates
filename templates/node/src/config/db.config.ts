// src/config/db.config.ts
import mongoose from "mongoose";
import { seedAdmin } from "../utils/seedAdmin";
import { AppConfig } from "./app.config";
import { NextFunction, Request, Response } from "express";
import { AppLogger } from "../utils/handlers/logHandler";

const MONGO_URI = AppConfig.MONGO_URI;
const DB_NAME = AppConfig.DB_NAME;

if (!MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

mongoose.set("sanitizeFilter", true);

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            dbName: DB_NAME,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            AppLogger.log(`Connected to MongoDB: ${DB_NAME}`);
            seedAdmin()
                .then(() => {})
                .catch(AppLogger.error);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export const databaseConfig = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
};
