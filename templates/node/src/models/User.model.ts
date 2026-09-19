// src/models/User.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import { hashPassword } from "../utils/handlers/passwordHandler";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    credits: number;
    role: string;
    isDeleted: boolean;
    createdAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false },
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
});

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;
