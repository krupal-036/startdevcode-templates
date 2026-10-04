// src/repositories/user.repo.ts
import { AppConfig } from "../config/app.config";
import { IUser, IUserRepository } from "../models/User.schema";
import { MongoUserRepository } from "../models/User.mongo.model";
import { MysqlUserRepository } from "../models/User.mysql.model";

let repo: IUserRepository;

if (AppConfig.DB_TYPE === "mysql") {
    repo = new MysqlUserRepository();
} else {
    repo = new MongoUserRepository();
}

export const activeUserRepo = (): IUserRepository => repo;

export const createUser = (user: Pick<IUser, "username" | "email" | "password" | "role">) =>
    repo.createUser(user);

export const getUserByField = (field: Record<string, any>, isPassword = false) =>
    repo.getUserByField(field, isPassword);

export const getUsersStats = () => repo.getUsersStats();

export const deleteUserById = (userId: any) => repo.deleteUserById(userId);

export const countUserByField = (field: any = {}) => repo.countUserByField(field);

export const updateUser = (userId: any, patch: Partial<IUser>) => repo.updateUser(userId, patch);
