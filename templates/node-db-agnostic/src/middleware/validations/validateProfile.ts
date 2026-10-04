// src/middleware/validations/validateProfile.ts
import { Response, NextFunction } from "express";
import { countUserByField, getUserByField } from "../../repositories/user.repo";
import { passwordRegex, usernameRegex } from "../../utils/regex";
import { HttpStatus } from "../../constants/http-status.enum";

export const validateProfile = async (req: any, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const userId = req.user?.id;
    try {
        const user = await getUserByField({ _id: userId }, true);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        let isChanged = false;

        if (username) {
            const trimmedName = username.trim().toLowerCase();

            if (!usernameRegex.test(trimmedName)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message:
                        "Username must start with a letter and contain only lowercase letters/numbers.",
                });
            }
            if (trimmedName.length < 3 || trimmedName.length > 20) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Username must be between 3 and 20 characters",
                });
            }

            const reservedWords = ["admin", "root", "support", "help", "official", "moderator"];
            if (reservedWords.includes(trimmedName)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "This username is reserved and cannot be used.",
                });
            }
            if (user.username !== trimmedName) {
                const existingUser = await countUserByField({
                    username: trimmedName,
                    _id: { $ne: userId },
                });

                if (existingUser) {
                    return res
                        .status(HttpStatus.BAD_REQUEST)
                        .json({ message: "Username is already taken" });
                }

                req.body.username = trimmedName;
                isChanged = true;
            }
        }

        if (password) {
            if (!passwordRegex.test(password)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message:
                        "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
                });
            }
            isChanged = true;
        }

        if (!isChanged) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "No changes provided" });
        }

        req.validatedUserData = user;

        next();
    } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Server validation failed during update user profile",
        });
    }
};
