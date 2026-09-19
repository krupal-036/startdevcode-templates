// src/controllers/user.controller.ts
import { Request, response, Response } from "express";
import * as service from "../services/user.service";
import { setCookie } from "../utils/handlers/cookieHandler";

export const register = async (req: Request, res: Response) => {
    const result = await service.register(req.body);
    if (result.data && "token" in result.data) {
        await setCookie(res, result.data.token);
    }
    return res.status(result.code).json(result.data);
};

export const login = async (req: Request, res: Response) => {
    const result = await service.login(req.user);
    if (result.data && "token" in result.data) {
        await setCookie(res, result.data.token);
    }
    return res.status(result.code).json(result.data);
};

export const updateUserData = async (req: Request, res: Response) => {
    const result = await service.updateUserData(req);
    return res.status(result.code).json(result.data);
};

export const deleteUser = async (req: Request, res: Response) => {
    const result = await service.deleteUser(req);
    return res.status(result.code).json(result.data);
};
