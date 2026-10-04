// src/middleware/healthCheck.middleware.ts
import { Request, Response } from "express";
import os from "os";
import { AppConfig } from "../config/app.config";
import { HttpStatus } from "../constants/http-status.enum";

export const healthCheck = (req: Request, res: Response): void => {
    res.status(HttpStatus.CREATED).json({
        status: "ok",
        code: HttpStatus.CREATED,
        message: "API is successfully working!",
        timestamp: new Date().toISOString(),
        environment: AppConfig.NODE_ENV,
        version: process.env.npm_package_version || "1.0.0",
        system: {
            platform: os.platform(),
            architecture: os.arch(),
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
        },
    });
};
