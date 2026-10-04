// src/config/cors.config.ts
import cors from "cors";
import { AppConfig } from "./app.config";

export const corsConfig = () => {
    return cors({
        origin: (origin, callback) => {
            if (AppConfig.NODE_ENV === "development") {
                return callback(null, true);
            }

            if (origin && AppConfig.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    });
};
