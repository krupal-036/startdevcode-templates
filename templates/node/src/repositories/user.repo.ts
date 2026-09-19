// src/repositories/user.repo.ts
import { QueryFilter } from "mongoose";
import User, { IUser } from "../models/User.model";

export const createUser = async (user: Pick<IUser, "username" | "email" | "password">) => {
    return await User.create({
        username: user.username,
        email: user.email,
        password: user.password,
    });
};

export const getUserByField = async (field: QueryFilter<IUser>, isPassword = false) => {
    const query = User.findOne(field);
    if (!isPassword) {
        query.select("-password");
    }
    return await query;
};

export const getUsersStats = async () => {
    return await User.aggregate([
        {
            $lookup: {
                from: "histories",
                localField: "_id",
                foreignField: "userId",
                as: "userHistory",
            },
        },
        { $addFields: { historyCount: { $size: "$userHistory" } } },
        { $project: { password: 0, userHistory: 0 } },
    ]);
};

export const deleteUserById = async (userId: any) => {
    return await User.findByIdAndDelete(userId);
};

export const countUserByField = async (field: any = {}) => {
    return await User.countDocuments(field);
};
