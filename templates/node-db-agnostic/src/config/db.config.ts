// src/config/db.config.ts
import "reflect-metadata";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { DataSource } from "typeorm";

import { AppConfig } from "./app.config";
import { AppLogger } from "../utils/handlers/logHandler";
import { UserMysql } from "../models/User.mysql.model";
import { seedAdmin } from "../utils/seedAdmin";

/* ------------------------------------------------------------------ */
/*  MongoDB                                                            */
/* ------------------------------------------------------------------ */
const MONGO_URI = AppConfig.MONGO_URI;
const DB_NAME = AppConfig.DB_NAME;

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

const connectMongo = async () => {
    if (cached.conn) return cached.conn;
    if (!MONGO_URI) throw new Error("Please define the MONGO_URI environment variable");

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGO_URI, {
                bufferCommands: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                dbName: DB_NAME,
            })
            .then((m) => {
                AppLogger.log(`Connected to MongoDB: ${DB_NAME}`);
                seedAdmin().catch(AppLogger.error);
                return m;
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

/* ------------------------------------------------------------------ */
/*  MySQL (TypeORM)                                                    */
/* ------------------------------------------------------------------ */
export const AppDataSource = new DataSource({
    type: "mysql",
    host: AppConfig.MYSQL_HOST,
    port: AppConfig.MYSQL_PORT,
    username: AppConfig.MYSQL_USER,
    password: AppConfig.MYSQL_PASSWORD,
    database: AppConfig.MYSQL_DATABASE,
    entities: [UserMysql],
    synchronize: true,
    logging: false,
});

let mysqlInitialized = false;
const connectMysql = async () => {
    if (mysqlInitialized && AppDataSource.isInitialized) return AppDataSource;
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        mysqlInitialized = true;
        AppLogger.log(
            `Connected to MySQL: ${AppConfig.MYSQL_DATABASE} @ ${AppConfig.MYSQL_HOST}:${AppConfig.MYSQL_PORT}`,
        );
        seedAdmin().catch(AppLogger.error);
    }
    return AppDataSource;
};

/* ------------------------------------------------------------------ */
/*  Middleware — picks driver based on AppConfig.DB_TYPE               */
/* ------------------------------------------------------------------ */
export const databaseConfig = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (AppConfig.DB_TYPE === "mysql") {
            await connectMysql();
        } else {
            await connectMongo();
        }
        next();
    } catch (err) {
        next(err);
    }
};
