// src/utils/handlers/logHandler.ts
import { AppConfig } from "../../config/app.config";

export class AppLogger {
    private static isDevelopment = AppConfig.NODE_ENV !== "production";

    static log(message: string, ...optionalParams: any[]): void {
        if (this.isDevelopment) {
            console.log(`[LOG] ${message}`, ...optionalParams);
        }
    }

    static error(message: string, ...optionalParams: any[]): void {
        console.error(`[ERROR] ${message}`, ...optionalParams);
    }

    static warn(message: string, ...optionalParams: any[]): void {
        if (this.isDevelopment) {
            console.warn(`[WARN] ${message}`, ...optionalParams);
        }
    }
}
