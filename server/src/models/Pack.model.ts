import mongoose, { Schema, Document } from "mongoose";

export interface IPack extends Document {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    accentColor: string;
    probabilities: {
        rarity: string;
        chance: number;
        color: string;
    }[];
    cards: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const PackSchema = new Schema<IPack>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    accentColor: { type: String, required: true },
    probabilities: [
        {
            rarity: { type: String, required: true },
            chance: { type: Number, required: true },
            color: { type: String, required: true }
        }
    ],
    cards: [{ type: Schema.Types.ObjectId, ref: "Card" }]
}, { timestamps: true });

export const Pack = mongoose.models.Pack || mongoose.model<IPack>("Pack", PackSchema);
