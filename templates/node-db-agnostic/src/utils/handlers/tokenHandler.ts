// src/utils/handlers/tokenHandler.ts
import jwt from "jsonwebtoken";
import { AppConfig } from "../../config/app.config";

const secret = AppConfig.JWT_SECRET;

export const signToken = (payload: any) => jwt.sign(payload, secret, { expiresIn: "30d" });

export const verifyToken = (token: string) => jwt.verify(token, secret);
