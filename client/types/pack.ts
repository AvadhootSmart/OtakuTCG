import { ICard } from "./card";

export interface IPack {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    accentColor: string;
    cards: string[] | ICard[];
    rarity?: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
    };
    createdAt: string;
    updatedAt: string;
}
