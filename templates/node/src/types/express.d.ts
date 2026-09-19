// src/types/express.d.ts
import * as express from "express";

declare global {
    namespace Express {
        interface Request {
            siteSignupDisabled?: boolean;
            siteLoginDisabled?: boolean;
            user?: UserRequest;
        }
    }
}
