// src/config/app.config.ts
class AppEnv {
    PORT = Number(process.env.PORT) || 3000;
    NODE_ENV = (process.env.NODE_ENV as string) || "development";
    JWT_SECRET = process.env.JWT_SECRET as string;
    ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS as string).split(",") as string[];
    ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
    ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
    MONGO_URI = process.env.MONGO_URI as string;
    DB_NAME = process.env.DB_NAME as string;
    isDevelopment = this.NODE_ENV === "development";
}

export const AppConfig = Object.freeze(new AppEnv());
