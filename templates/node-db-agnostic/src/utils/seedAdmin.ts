// src/utils/seedAdmin.ts
import { AppConfig } from "../config/app.config";
import { createUser, getUserByField } from "../repositories/user.repo";
import { AppLogger } from "./handlers/logHandler";

export const seedAdmin = async () => {
    const adminEmail = AppConfig.ADMIN_EMAIL;
    const adminPassword = AppConfig.ADMIN_PASSWORD;

    const existing = await getUserByField({ email: adminEmail });
    if (existing) {
        AppLogger.log("Default admin user already exists. Skipping seed.");
        return;
    }

    await createUser({
        username: "admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
    });
    AppLogger.log("Default admin user seeded successfully.");
};
