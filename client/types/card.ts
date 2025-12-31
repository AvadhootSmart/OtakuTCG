export interface ICard {
    _id: string;
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
    createdAt: string;
    updatedAt: string;
}

