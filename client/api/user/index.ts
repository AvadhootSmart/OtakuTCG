import { api } from "../../lib/axios.config";
import { ICard } from "../../types/card";
import { IPack } from "../../types/pack";

export interface IUserProfile {
    userId: string;
    balance: number;
    xp: number;
    level: number;
    ownedCards: {
        cardId: ICard;
        count: number;
        obtainedAt: string;
    }[];
    inventoryPacks: {
        packId: IPack;
        count: number;
        obtainedAt: string;
    }[];
    stats: {
        matchesPlayed: number;
        matchesWon: number;
    };
    createdAt: string;
    updatedAt: string;
}

export const getProfile = async (): Promise<IUserProfile> => {
    const response = await api.get("/user/profile");
    return response.data;
};

export const buyCurrency = async (amount: number): Promise<{ message: string, balance: number }> => {
    const response = await api.post("/user/buy-currency", { amount });
    return response.data;
};
