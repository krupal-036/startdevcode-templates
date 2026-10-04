// src/middleware/validations/validateLogin.ts
import { NextFunction, Request, Response } from "express";
import { emailRegex, passwordRegex } from "../../utils/regex";
import { getUserByField } from "../../repositories/user.repo";
import { HttpStatus } from "../../constants/http-status.enum";
import { comparePassword } from "../../utils/handlers/passwordHandler";

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const email = req.body.email?.trim()?.toLowerCase();

    if (!email || !password || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "All fields are required" });
    }

    if (!email) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Email is required" });
    if (!password)
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Password is required" });

    if (!emailRegex.test(email)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid Email Format" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: "Invalid Password Format. Check length and required characters.",
        });
    }

    try {
        const user = await getUserByField({ email: email }, true);

        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid email Address.." });
        }

        if (req.siteLoginDisabled && user.role !== "admin") {
            return res.status(HttpStatus.FORBIDDEN).json({
                message: "Login is temporarily disabled for users. Please try again later.",
            });
        }

        if (user.isDeleted) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ message: "Your Account was deactivated" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid password" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Server validation failed during login" });
    }
};
