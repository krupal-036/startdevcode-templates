// src/config/app.config.ts
class AppEnv {
    PORT = Number(process.env.PORT) || 3000;
    NODE_ENV = (process.env.NODE_ENV as string) || "development";
    JWT_SECRET = process.env.JWT_SECRET as string;
    ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS as string).split(",") as string[];
    ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
    ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

    DB_TYPE = (process.env.DB_TYPE as "mongodb" | "mysql") || "mongodb";

    MONGO_URI = process.env.MONGO_URI as string;
    DB_NAME = process.env.DB_NAME as string;

    MYSQL_HOST = process.env.MYSQL_HOST as string;
    MYSQL_PORT = Number(process.env.MYSQL_PORT) || 3306;
    MYSQL_USER = process.env.MYSQL_USER as string;
    MYSQL_PASSWORD = process.env.MYSQL_PASSWORD as string;
    MYSQL_DATABASE = process.env.MYSQL_DATABASE as string;

    isDevelopment = this.NODE_ENV === "development";
    isMongo = this.DB_TYPE === "mongodb";
    isMysql = this.DB_TYPE === "mysql";
}

export const AppConfig = Object.freeze(new AppEnv());
