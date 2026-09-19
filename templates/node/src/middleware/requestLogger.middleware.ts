// src/middleware/requestLogger.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppLogger } from "../utils/handlers/logHandler";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const timestamp = new Date().toISOString();
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        const { method, originalUrl } = req;
        const { statusCode } = res;

        const logMessage = `[${timestamp}] ${method} ${originalUrl} ${statusCode} - ${durationInMs}ms - IP: ${clientIp}`;

        if (statusCode >= 500) {
            AppLogger.error(logMessage);
        } else if (statusCode >= 400) {
            AppLogger.warn(logMessage);
        } else {
            AppLogger.log(logMessage);
        }
    });

    next();
};
