import { ICard } from "./card";

export interface IPack {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    cards: string[] | ICard[];
    probabilities?: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
    };
    createdAt: string;
    updatedAt: string;
}
