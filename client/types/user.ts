import { ICard } from "./card";
import { IPack } from "./pack";

export interface IUserProfile {
    _id: string;
    userId: string;
    balance: number;
    xp: number;
    level: number;
    ownedCards: {
        _id: string; // The ID of the ownership record itself? Mongoose arrays of subdocs have IDs.
        cardId: ICard;
        count: number;
        obtainedAt: string;
    }[];
    inventoryPacks: {
        _id: string;
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
