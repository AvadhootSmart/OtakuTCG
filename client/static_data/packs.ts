export interface PackProbability {
    rarity: string;
    chance: number;
    color: string;
}

export interface CardPack {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    accentColor: string;
    probabilities: PackProbability[];
}

export const packs: CardPack[] = [
    {
        id: "starter-pack",
        name: "Origins Alpha",
        description: "The perfect start for any aspiring duelist. Contains classic heroes.",
        price: 500,
        imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
        accentColor: "blue",
        probabilities: [
            { rarity: "Common", chance: 75, color: "#94a3b8" },
            { rarity: "Rare", chance: 20, color: "#3b82f6" },
            { rarity: "Epic", chance: 4.5, color: "#a855f7" },
            { rarity: "Legendary", chance: 0.5, color: "#f59e0b" }
        ]
    },
    {
        id: "cursed-spirits",
        name: "Sorcery Unleashed",
        description: "High risk, high reward. Specialized in powerful cursed energy cards.",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
        accentColor: "purple",
        probabilities: [
            { rarity: "Common", chance: 50, color: "#94a3b8" },
            { rarity: "Rare", chance: 30, color: "#3b82f6" },
            { rarity: "Epic", chance: 15, color: "#a855f7" },
            { rarity: "Legendary", chance: 5, color: "#f59e0b" }
        ]
    },
    {
        id: "legendary-echoes",
        name: "Godlike Artifacts",
        description: "Premium pack containing only the most prestigious warriors of history.",
        price: 5000,
        imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
        accentColor: "amber",
        probabilities: [
            { rarity: "Rare", chance: 60, color: "#3b82f6" },
            { rarity: "Epic", chance: 30, color: "#a855f7" },
            { rarity: "Legendary", chance: 10, color: "#f59e0b" }
        ]
    }
];
