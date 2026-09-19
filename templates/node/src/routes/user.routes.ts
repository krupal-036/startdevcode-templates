// src/routes/user.routes.ts
import { Router } from "express";
import { validateRegister } from "../middleware/validations/validateRegister";
import { validateLogin } from "../middleware/validations/validateLogin";
import * as c from "../controllers/user.controller";
import { validateDeleteProfile, validateUser } from "../middleware/validations/validateUser";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";
import { validateProfile } from "../middleware/validations/validateProfile";

const r = Router();

// @route   POST api/auth/register
// @desc    Create new User
r.post("/register", validateRegister, c.register);

// @route   POST api/auth/login
// @desk    Login Existing User
r.post("/login", validateLogin, c.login);

r.put(
    "/update",
    authenticate,
    authorizeRoles("admin", "user"),
    validateProfile,
    validateUser,
    c.updateUserData,
);

r.delete("/delete", authenticate, validateDeleteProfile, c.deleteUser);

export default r;
