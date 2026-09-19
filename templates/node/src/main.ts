// src/main.ts
import "dotenv/config";
import fs from "fs";
import path from "path";

import express, { RequestHandler } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.routes";

import { errorHandler } from "./middleware/errorHandler.middleware";
import { serveFrontend } from "./middleware/serveFrontend.middleware";
import { corsConfig } from "./config/cors.config";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { apiLimiter, authLimiter, rateLimiter } from "./middleware/apiLimiter";
import { healthCheck } from "./middleware/healthCheck.middleware";
import { databaseConfig } from "./config/db.config";
import { startDevServer } from "./utils/handlers/serverHandler";

const app = express();
const DIST_PATH: string = fs.existsSync(path.join(process.cwd(), "public"))
    ? path.join(process.cwd(), "public")
    : path.join(process.cwd(), "backend", "public");
const serveApp: RequestHandler = serveFrontend(DIST_PATH);

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(express.static(DIST_PATH));

app.use(corsConfig());
app.use(databaseConfig());

app.use("/api/auth", authLimiter, userRoutes);
app.get("/api/health", rateLimiter, healthCheck);

startDevServer(app);

app.get("/", serveApp);
app.get("/api/*splat", serveApp);
app.get("*splat", serveApp);

app.use(errorHandler);

export default app;
