import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
    userId: string;
    balance: number;
    xp: number;
    level: number;
    ownedCards: {
        cardId: any;
        count: number;
        obtainedAt: Date;
    }[];
    inventoryPacks: {
        packId: any;
        count: number;
        obtainedAt: Date;
    }[];
    stats: {
        matchesPlayed: number;
        matchesWon: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 30000 }, // Starting balance
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    ownedCards: [
        {
            cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
            count: { type: Number, default: 1 },
            obtainedAt: { type: Date, default: Date.now }
        }
    ],
    inventoryPacks: [
        {
            packId: { type: Schema.Types.ObjectId, ref: "Pack", required: true },
            count: { type: Number, default: 1 },
            obtainedAt: { type: Date, default: Date.now }
        }
    ],
    stats: {
        matchesPlayed: { type: Number, default: 0 },
        matchesWon: { type: Number, default: 0 }
    }
}, { timestamps: true });

export const UserProfile = mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
