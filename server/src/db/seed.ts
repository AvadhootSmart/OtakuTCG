import { Card, ICard } from "../models/Card.model.js";
import { Pack } from "../models/Pack.model.js";
import { Mission } from "../models/Mission.model.js";
import { getEffectiveWeight } from "../utils/rarity.js";

const initialCards = [
    {
        name: "Gojo Satoru",
        overall: 89,
        rarity: "legendary",
        imageUrl: "gojo.gif",
        weight: 1,
        attributes: {
            attack: 94, defense: 82, speed: 88, intelligence: 85
        }
    },
    {
        name: "Itadori Yuji",
        overall: 82,
        rarity: "rare",
        imageUrl: "https://us.oricon-group.com/upimg/detail/2000/2833/img660/yuji-itadori-jjk-EP32%20(10).jpg",
        weight: 1.5,
        attributes: {
            attack: 85, defense: 80, speed: 82, intelligence: 70
        }
    },
    {
        name: "Tanjiro Kamado",
        overall: 80,
        rarity: "rare",
        imageUrl: "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/09/tanjiro-kamado-from-demon-slayer-infinity-castle-movie.jpg",
        weight: 1.5,
        attributes: {
            attack: 82, defense: 78, speed: 84, intelligence: 75
        }
    },
    {
        name: "Levi Ackerman",
        overall: 88,
        rarity: "epic",
        imageUrl: "https://static.wikia.nocookie.net/shingekinokyojin/images/0/0a/Levi_Ackermann_%28Anime%29_character_image_%28854%29.png/revision/latest?cb=20231106070611",
        weight: 1,
        attributes: {
            attack: 92, defense: 85, speed: 80, intelligence: 82
        }
    },
    {
        name: "Eren Yeager",
        overall: 85,
        rarity: "epic",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        weight: 1,
        attributes: {
            attack: 88, defense: 75, speed: 95, intelligence: 90
        }
    },
    {
        name: "Guts",
        overall: 92,
        rarity: "rare",
        imageUrl: "https://preview.redd.it/its-fanart-but-i-find-this-picture-of-guts-incredibly-v0-4bqhih6hof7a1.jpg?width=640&crop=smart&auto=webp&s=cbf4cacb2ec18d10835d6a519168a647e8a54a86",
        weight: 1,
        attributes: {
            attack: 96, defense: 94, speed: 70, intelligence: 80
        }
    },
    {
        name: "Rock Lee",
        overall: 78,
        rarity: "common",
        imageUrl: "https://static.wikia.nocookie.net/naruto/images/9/97/Rock_Lee_Part_I.png/revision/latest/scale-to-width-down/1200?cb=20181229065526",
        weight: 1,
        attributes: {
            attack: 84, defense: 70, speed: 92, intelligence: 65
        }
    }
];

const initialMissions = [
    {
        title: "Heavy Hitters",
        description: "Assemble a squad with overwhelming raw power.",
        difficulty: "Easy",
        criterias: [
            {
                type: 'min_total_stat',
                target: 'attack',
                value: 400,
                description: "Total Attack must be at least 400"
            },
            {
                type: 'min_total_overall',
                target: 'overall',
                value: 250,
                description: "Team total overall rating must be at least 250"
            }
        ],
        rewardType: "coins",
        rewardCoins: 200,
        rewardXp: 100
    },
    {
        title: "Tactical Minds",
        description: "Intelligence wins battles before they begin.",
        difficulty: "Medium",
        criterias: [
            {
                type: 'min_card_stat',
                target: 'intelligence',
                value: 80,
                description: "All cards must have at least 80 Intelligence"
            },
            {
                type: 'rarity_count',
                target: 'rare',
                value: 3,
                description: "Include at least 3 Rare cards (or better)"
            }
        ],
        rewardType: "coins",
        rewardCoins: 600,
        rewardXp: 300
    },
    {
        title: "Speed Blitz",
        description: "Strike fast and hard with a small elite team.",
        difficulty: "Hard",
        criterias: [
            {
                type: 'max_cards',
                target: 'count',
                value: 3,
                description: "Use exactly 3 cards"
            },
            {
                type: 'min_total_stat',
                target: 'speed',
                value: 280,
                description: "Total Speed must be at least 280"
            }
        ],
        rewardType: "pack",
        rewardCoins: 1000,
        rewardXp: 500,
        packName: "Origins Alpha"
    },
    {
        title: "Iron Wall Defense",
        description: "Create an impenetrable defensive line.",
        difficulty: "Expert",
        criterias: [
            {
                type: 'min_total_stat',
                target: 'defense',
                value: 1000,
                description: "Total Defense must be at least 1000"
            },
            {
                type: 'rarity_count',
                target: 'epic',
                value: 2,
                description: "Include at least 2 Epic cards (or better)"
            }
        ],
        rewardType: "pack",
        rewardCoins: 2000,
        rewardXp: 1000,
        packName: "Godlike Artifacts"
    }
];

export async function seedDatabase() {
    try {
        const cardCount = await Card.countDocuments();
        const packCount = await Pack.countDocuments();
        const missionCount = await Mission.countDocuments();

        // If we have at least 6 packs and 4 missions, we assume we're good.
        if (cardCount >= initialCards.length && packCount >= 6 && missionCount >= 4) {
            console.log("Database already seeded with enough items, skipping...");
            return;
        }

        console.log("Seeding database with new cards, packs and missions...");
        await Card.deleteMany({});
        await Pack.deleteMany({});
        await Mission.deleteMany({});

        const seededCards = await Card.insertMany(initialCards);

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
                imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
                accentColor: "purple",
                cardDocs: seededCards.filter((c: ICard) => ["legendary", "epic", "rare"].includes(c.rarity))
            },
            {
                name: "Uprising Storm",
                description: "Feel the power of the titans and the scouts. High mobility warriors.",
                price: 1500,
                imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
                accentColor: "amber",
                cardDocs: seededCards.filter((c: ICard) => c.name.includes("Eren") || c.name.includes("Levi") || c.rarity === "common")
            },
            {
                name: "Demon Slayer Pack",
                description: "Master the breathing techniques with Tanjiro and others.",
                price: 800,
                imageUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000&auto=format&fit=crop",
                accentColor: "blue",
                cardDocs: seededCards.filter((c: ICard) => c.name.includes("Tanjiro") || c.rarity === "common")
            },
            {
                name: "Cursed Kings",
                description: "The most powerful sorcerers and spirits gathered in one place.",
                price: 3000,
                imageUrl: "https://images.unsplash.com/photo-1626544823105-db93a58a683a?q=80&w=1000&auto=format&fit=crop",
                accentColor: "purple",
                cardDocs: seededCards.filter((c: ICard) => ["legendary", "epic"].includes(c.rarity))
            },
            {
                name: "Godlike Artifacts",
                description: "Premium pack containing only the most prestigious warriors of history.",
                price: 5000,
                imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
                accentColor: "amber",
                cardDocs: seededCards.filter((c: ICard) => ["legendary", "epic"].includes(c.rarity))
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

        const seededPacks = await Pack.insertMany(initialPacks);
        console.log("Packs seeded with scoped probabilities");

        // Seed Missions
        const missionsToSeed = initialMissions.map(m => {
            const missionData: any = { ...m };
            if (m.rewardType === 'pack' && (m as any).packName) {
                const targetPack = seededPacks.find(p => p.name === (m as any).packName);
                if (targetPack) {
                    missionData.rewardPackId = targetPack._id;
                }
                delete missionData.packName;
            }
            return missionData;
        });

        await Mission.insertMany(missionsToSeed);
        console.log("Missions seeded successfully");

    } catch (error) {
        console.error("Seeding error:", error);
    }
}
