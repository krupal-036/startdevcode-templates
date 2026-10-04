// src/middleware/errorHandler.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../config/app.config";
import { HttpStatus } from "../constants/http-status.enum";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error("--- Global Error Handler ---");
    console.error(err);

    let statusCode = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal Server Error";
    let errors: any = undefined;

    if (err.name === "ValidationError") {
        statusCode = HttpStatus.BAD_REQUEST;
        message = "Mongoose Schema Validation Failed";
        errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            value: e.value,
            message: e.message,
        }));
    } else if (err.code === 11000) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = "Database Conflict Error";
        const key = err.keyValue ? (Object.keys(err.keyValue)[0] as string) : "field";
        const value = err.keyValue ? err.keyValue[key] : "value";
        errors = [
            {
                field: key,
                value: value,
                message: `${key} '${value}' is already registered and must be unique`,
            },
        ];
    } else if (err.name === "JsonWebTokenError") {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = "Invalid access token";
    } else if (err.name === "TokenExpiredError") {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = "Access token has expired";
    }

    return res.status(statusCode).json({
        data: {
            success: false,
            message,
            errors,
            stack: AppConfig.NODE_ENV === "production" ? undefined : err.stack,
        },
    });
}
