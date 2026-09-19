// src/utils/handlers/serverHandler.ts
import { AppConfig } from "../../config/app.config";
import { AppLogger } from "./logHandler";

export const startDevServer = (app: any): void => {
    if (AppConfig.NODE_ENV !== "production") {
        const PORT = AppConfig.PORT;
        app.listen(PORT, "0.0.0.0", () => {
            AppLogger.log(`[${AppConfig.NODE_ENV}] Server running on http://localhost:${PORT}`);
        });
    }
};
