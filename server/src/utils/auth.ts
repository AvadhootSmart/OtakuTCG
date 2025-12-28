import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, db } from "../db/db.config";
import { jwt } from "better-auth/plugins";
import { UserProfile } from "../models/UserProfile.model";

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client: client
    }),
    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await UserProfile.create({
                        userId: user.id,
                        balance: 500,
                    });
                }
            }
        }
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        process.env.CLIENT_URL || "http://localhost:3000"
    ],
    plugins: [
        jwt()
    ]
});