// src/middleware/validations/validateRegister.ts
import { NextFunction, Request, Response } from "express";
import { emailRegex, passwordRegex, usernameRegex } from "../../utils/regex";
import { getUserByField } from "../../repositories/user.repo";
import { HttpStatus } from "../../constants/http-status.enum";

export const validateRegister = async (req: Request, res: Response, next: NextFunction) => {
    if (req.siteSignupDisabled) {
        return res.status(HttpStatus.FORBIDDEN).json({
            message: "New sign-ups are currently disabled by the administrator.",
        });
    }

    const { username, password } = req.body;
    const email = req.body.email?.trim()?.toLowerCase();

    if (!email || !password || !username || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "All fields are required" });
    }

    const trimmedName = username.trim().toLowerCase();

    if (!usernameRegex.test(trimmedName)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message:
                "Username must start with a letter and contain only lowercase letters/numbers.",
        });
    }

    if (trimmedName.length < 3 || trimmedName.length > 20) {
        return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: "Username must be between 3 and 20 characters" });
    }

    const reservedWords = ["admin", "root", "support", "help", "official", "moderator"];
    if (reservedWords.includes(trimmedName)) {
        return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: "This username is reserved and cannot be used." });
    }

    if (!emailRegex.test(email)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid Email Address" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message:
                "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
        });
    }

    try {
        const existingUsername = await getUserByField({
            username: trimmedName,
        });
        if (existingUsername) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ message: "Username is already taken" });
        }

        const existingEmail = await getUserByField({ email: email });
        if (existingEmail) {
            return res
                .status(HttpStatus.CONFLICT)
                .json({ message: "User with this email already exists" });
        }

        req.user = { username: trimmedName, email, password };

        next();
    } catch (err) {
        return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Server validation failed during registration" });
    }
};
