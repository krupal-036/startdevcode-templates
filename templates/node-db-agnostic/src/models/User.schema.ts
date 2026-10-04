// src/models/User.schema.ts

/**
 * Abstract, DB-agnostic contract for a User entity.
 * Both Mongoose and TypeORM implementations must conform to this.
 */
export interface IUser {
    id?: string | number;
    _id?: string;
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
    isDeleted: boolean;
    createdAt?: Date;
}

export interface IUserRepository {
    createUser(user: Pick<IUser, "username" | "email" | "password" | "role">): Promise<IUser>;

    getUserByField(field: Record<string, any>, isPassword?: boolean): Promise<IUser | null>;

    countUserByField(field?: Record<string, any>): Promise<number>;

    deleteUserById(userId: any): Promise<any>;

    updateUser(userId: any, patch: Partial<IUser>): Promise<IUser | null>;

    getUsersStats(): Promise<any[]>;
}
