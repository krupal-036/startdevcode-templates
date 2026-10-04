// src/services/user.service.ts
import { IUser } from "../models/User.schema";
import * as userRepo from "../repositories/user.repo";
import { UserRequest } from "../types/types";
import { HttpStatus } from "../constants/http-status.enum";
import { signToken } from "../utils/handlers/tokenHandler";
import { ResponseHandler } from "../utils/handlers/responseHandler";

export const register = async (userData: Pick<IUser, "username" | "email" | "password">) => {
    try {
        const user = await userRepo.createUser({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: "user",
        });
        const token = signToken({
            userId: user.id ?? user._id,
            name: user.username,
            email: user.email,
            role: user.role,
        });
        return ResponseHandler.send(HttpStatus.CREATED, { token });
    } catch (err: any) {
        return ResponseHandler.send(HttpStatus.BAD_REQUEST, {
            message: "Server not Available",
        });
    }
};

export const login = async (user: UserRequest) => {
    try {
        const token = signToken({
            userId: user.id,
            role: user.role,
            name: user.username,
            email: user.email,
        });
        return ResponseHandler.send(HttpStatus.OK, { token });
    } catch (err: any) {
        return ResponseHandler.send(HttpStatus.BAD_REQUEST, {
            message: "Server not Available",
        });
    }
};

export const updateUserData = async (req: any) => {
    const { username, password } = req.body;
    try {
        const user = req.validatedUserData;
        const patch: Partial<IUser> = {};
        if (username) patch.username = username;
        if (password) patch.password = password;

        const updated = await userRepo.updateUser(user.id ?? user._id, patch);
        if (!updated) {
            return ResponseHandler.send(HttpStatus.NOT_FOUND, {
                message: "User not found",
            });
        }

        return ResponseHandler.send(HttpStatus.CREATED, {
            message: "Profile updated successfully",
            user: {
                id: updated.id ?? updated._id,
                name: updated.username,
                email: updated.email,
                role: updated.role,
            },
        });
    } catch (err) {
        return ResponseHandler.send(HttpStatus.INTERNAL_SERVER_ERROR, {
            message: "Profile Update failed.",
        });
    }
};

export const deleteUser = async (req: any) => {
    try {
        const user = req.validatedUserData;
        await userRepo.deleteUserById(user.id ?? user._id);
        return ResponseHandler.send(HttpStatus.OK, {
            message: "User account deleted successfully.",
        });
    } catch (err) {
        return ResponseHandler.send(HttpStatus.INTERNAL_SERVER_ERROR, {
            message: "Account deletion failed.",
        });
    }
};
