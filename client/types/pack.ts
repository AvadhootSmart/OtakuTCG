export interface IPackProbability {
    rarity: string;
    chance: number;
    color: string;
}

export interface IPack {
    _id: string;
    id?: string; // For compatibility
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    accentColor: string;
    probabilities: IPackProbability[];
    cards: string[];
    createdAt: string;
    updatedAt: string;
}
