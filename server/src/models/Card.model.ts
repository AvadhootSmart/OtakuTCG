import mongoose, { Schema, Document } from "mongoose";

export interface ICard extends Document {
    name: string;
    overall: number;
    rarity: "common" | "rare" | "epic" | "legendary";
    imageUrl: string;
    attributes: {
        attack: number;
        defense: number;
        speed: number;
        intelligence: number;
    };
    weight: number;
    createdAt: Date;
    updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
    name: { type: String, required: true },
    overall: { type: Number, required: true },
    rarity: {
        type: String,
        required: true,
        enum: ["common", "rare", "epic", "legendary"]
    },
    imageUrl: { type: String, required: true },
    attributes: {
        attack: { type: Number, required: true },
        defense: { type: Number, required: true },
        speed: { type: Number, required: true },
        intelligence: { type: Number, required: true }
    },
    weight: { type: Number, default: 100 }
}, { timestamps: true });

export const Card = mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);
