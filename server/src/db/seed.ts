import { Card } from "../models/Card.model";
import { Pack } from "../models/Pack.model";
import { getEffectiveWeight } from "../utils/rarity";

const initialCards = [
    {
        name: "Gojo Satoru",
        overall: 89,
        rarity: "legendary",
        imageUrl: "gojo.gif",
        weight: 1, // Multiplier within legendary
        attributes: {
            attack: 94,
            defense: 82,
            speed: 88,
            intelligence: 85,
            health: 90,
            energy: 86
        }
    },
    {
        name: "Levi Ackerman",
        overall: 85,
        rarity: "epic",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        weight: 1,
        attributes: {
            attack: 88,
            defense: 75,
            speed: 95,
            intelligence: 90,
            health: 82,
            energy: 88
        }
    },
    {
        name: "Guts",
        overall: 92,
        rarity: "rare",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        weight: 1,
        attributes: {
            attack: 96,
            defense: 94,
            speed: 70,
            intelligence: 80,
            health: 98,
            energy: 85
        }
    },
    {
        name: "Rock Lee",
        overall: 78,
        rarity: "common",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        weight: 1,
        attributes: {
            attack: 84,
            defense: 70,
            speed: 92,
            intelligence: 65,
            health: 80,
            energy: 75
        }
    }
];

export async function seedDatabase() {
    try {
        await Card.deleteMany({});
        await Pack.deleteMany({});

        const seededCards = await Card.insertMany(initialCards);
        console.log("Cards seeded with scoped rarity multipliers");

        const packSpecs = [
            {
                name: "Origins Alpha",
                description: "The perfect start for any aspiring duelist. Contains classic heroes.",
                price: 500,
                imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
                accentColor: "blue",
                cardDocs: seededCards
            },
            {
                name: "Sorcery Unleashed",
                description: "High risk, high reward. Specialized in powerful cursed energy cards.",
                price: 1200,
                imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop",
                accentColor: "purple",
                cardDocs: seededCards.filter(c => ["legendary", "epic", "rare"].includes(c.rarity))
            },
            {
                name: "Godlike Artifacts",
                description: "Premium pack containing only the most prestigious warriors of history.",
                price: 5000,
                imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
                accentColor: "amber",
                cardDocs: seededCards.filter(c => ["legendary", "epic"].includes(c.rarity))
            }
        ];

        const initialPacks = packSpecs.map(spec => {
            const totalWeight = spec.cardDocs.reduce((sum: number, c: any) =>
                sum + getEffectiveWeight(c.rarity, c.weight), 0);

            const rarityGroups: Record<string, { weight: number, color: string }> = {
                "Common": { weight: 0, color: "#94a3b8" },
                "Rare": { weight: 0, color: "#3b82f6" },
                "Epic": { weight: 0, color: "#a855f7" },
                "Legendary": { weight: 0, color: "#f59e0b" }
            };

            spec.cardDocs.forEach((c: any) => {
                const r = c.rarity.charAt(0).toUpperCase() + c.rarity.slice(1);
                if (rarityGroups[r]) {
                    rarityGroups[r].weight += getEffectiveWeight(c.rarity, c.weight);
                }
            });

            const probabilities = Object.entries(rarityGroups)
                .filter(([_, data]) => data.weight > 0)
                .map(([rarity, data]) => ({
                    rarity,
                    chance: Number(((data.weight / totalWeight) * 100).toFixed(1)),
                    color: data.color
                }));

            return {
                name: spec.name,
                description: spec.description,
                price: spec.price,
                imageUrl: spec.imageUrl,
                accentColor: spec.accentColor,
                cards: spec.cardDocs.map((c: any) => c._id),
                probabilities
            };
        });

        await Pack.insertMany(initialPacks);
        console.log("Packs seeded with scoped probabilities");

    } catch (error) {
        console.error("Seeding error:", error);
    }
}
