// src/models/User.mysql.model.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser, IUserRepository } from "./User.schema";
import { AppDataSource } from "../config/db.config";
import { hashPassword } from "../utils/handlers/passwordHandler";

@Entity("users")
export class UserMysql implements IUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    username!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    @Column({ type: "enum", enum: ["user", "admin"], default: "user" })
    role!: "user" | "admin";

    @Column({ name: "is_deleted", type: "boolean", default: false })
    isDeleted!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}

const mapToIUser = (u: UserMysql | null): IUser | null => {
    if (!u) return null;
    return {
        id: String(u.id),
        _id: String(u.id),
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        isDeleted: u.isDeleted,
        createdAt: u.createdAt,
    };
};

const translateField = (field: Record<string, any>): Record<string, any> => {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(field)) {
        if (k === "_id" || k === "id") out["id"] = v;
        else if (k === "isDeleted") out["isDeleted"] = v;
        else out[k] = v;
    }
    return out;
};

export class MysqlUserRepository implements IUserRepository {
    private get repo() {
        return AppDataSource.getRepository(UserMysql);
    }

    async createUser(
        user: Pick<IUser, "username" | "email" | "password" | "role">,
    ): Promise<IUser> {
        const hashed = await hashPassword(user.password);
        const entity = this.repo.create({
            username: user.username,
            email: user.email,
            password: hashed,
            role: user.role ?? "user",
            isDeleted: false,
        });
        const saved = await this.repo.save(entity);
        return mapToIUser(saved) as IUser;
    }

    async getUserByField(field: Record<string, any>, isPassword = false): Promise<IUser | null> {
        const where = translateField(field);
        const user = await this.repo.findOne({ where });
        if (!user) return null;
        const mapped = mapToIUser(user);
        if (!mapped) return null;
        if (!isPassword) delete (mapped as any).password;
        return mapped;
    }

    async countUserByField(field: any = {}): Promise<number> {
        return await this.repo.count({ where: translateField(field) });
    }

    async deleteUserById(userId: any) {
        return await this.repo.delete(userId);
    }

    async updateUser(userId: any, patch: Partial<IUser>): Promise<IUser | null> {
        const user = await this.repo.findOne({ where: { id: userId } });
        if (!user) return null;

        if (patch.username) user.username = patch.username;
        if (patch.email) user.email = patch.email;
        if (patch.role) user.role = patch.role;
        if (patch.isDeleted !== undefined) user.isDeleted = patch.isDeleted;
        if (patch.password) user.password = await hashPassword(patch.password);

        const saved = await this.repo.save(user);
        return mapToIUser(saved);
    }

    async getUsersStats() {
        return await this.repo.find({ select: ["id", "username", "email", "role"] });
    }
}
