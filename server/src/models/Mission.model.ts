import mongoose, { Schema, Document } from "mongoose";

export interface IMissionCriteria {
    type: 'min_total_stat' | 'min_card_stat' | 'rarity_count' | 'min_total_overall' | 'max_cards';
    target: 'attack' | 'defense' | 'speed' | 'intelligence' | 'overall' | 'count' | string;
    value: number;
    description: string;
}

export interface IMission extends Document {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    criterias: IMissionCriteria[];
    rewardType: "card" | "pack" | "coins";
    rewardCoins?: number;
    rewardCardId?: mongoose.Types.ObjectId;
    rewardPackId?: mongoose.Types.ObjectId;
    rewardXp: number;
    createdAt: Date;
    updatedAt: Date;
}

const MissionSchema = new Schema<IMission>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard", "Expert"]
    },
    criterias: [
        {
            type: { type: String, required: true },
            target: { type: String, required: true },
            value: { type: Number, required: true },
            description: { type: String, required: true }
        }
    ],
    rewardType: {
        type: String,
        required: true,
        enum: ["card", "pack", "coins"]
    },
    rewardCoins: { type: Number },
    rewardCardId: { type: Schema.Types.ObjectId, ref: "Card" },
    rewardPackId: { type: Schema.Types.ObjectId, ref: "Pack" },
    rewardXp: { type: Number, required: true }
}, { timestamps: true });

export const Mission = mongoose.models.Mission || mongoose.model<IMission>("Mission", MissionSchema);
