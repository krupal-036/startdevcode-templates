// src/models/User.mongo.model.ts
import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { hashPassword } from "../utils/handlers/passwordHandler";
import { IUser, IUserRepository } from "./User.schema";

export type IUserMongo = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
    {
        username: { type: String, trim: true },
        email: { type: String, unique: true, lowercase: true, trim: true },
        password: { type: String, trim: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isDeleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false },
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
});

const UserMongo: Model<IUser> =
    (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);

const normalize = (doc: any): IUser | null => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return { ...obj, id: String(obj._id) };
};

export class MongoUserRepository implements IUserRepository {
    async createUser(
        user: Pick<IUser, "username" | "email" | "password" | "role">,
    ): Promise<IUser> {
        const created = await UserMongo.create({
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role ?? "user",
        });
        return normalize(created) as IUser;
    }

    async getUserByField(field: Record<string, any>, isPassword = false): Promise<IUser | null> {
        const query = UserMongo.findOne(field);
        if (!isPassword) query.select("-password");
        const doc = await query;
        return normalize(doc);
    }

    async countUserByField(field: any = {}): Promise<number> {
        return await UserMongo.countDocuments(field);
    }

    async deleteUserById(userId: any) {
        return await UserMongo.findByIdAndDelete(userId);
    }

    async updateUser(userId: any, patch: Partial<IUser>): Promise<IUser | null> {
        const doc = await UserMongo.findById(userId);
        if (!doc) return null;
        Object.assign(doc, patch);
        await doc.save();
        return normalize(doc);
    }

    async getUsersStats() {
        return await UserMongo.aggregate([
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
    }
}

export { UserMongo };
