// src/middleware/serveFrontend.middleware.ts
import { NextFunction, Response } from "express";
import fs from "fs";
import path from "path";
import { HttpStatus } from "../constants/http-status.enum";

export const serveFrontend = (DIST_PATH: string) => {
    return (req: any, res: Response, next: NextFunction) => {
        const htmlPath = path.join(DIST_PATH, "index.html");

        try {
            if (fs.existsSync(htmlPath)) {
                return res.sendFile(htmlPath);
            }

            return res.status(HttpStatus.NOT_FOUND).json({
                error: "Frontend build not found",
            });
        } catch (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Error loading frontend",
            });
        }
    };
};
