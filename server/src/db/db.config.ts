import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/otakutcg";

if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

export const client = new MongoClient(uri);

export async function connectDB() {
    try {
        // Connect native MongoDB client (for better-auth)
        await client.connect();

        // Connect Mongoose (for our models)
        await mongoose.connect(uri);

        console.log("Connected successfully to MongoDB and Mongoose");
        return client.db();
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export const db = client.db();
