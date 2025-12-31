
export interface IDispatchMission {
    id: string;
    title: string;
    description: string;
    difficulty: "D" | "C" | "B" | "A" | "S";
    duration: number; // in seconds
    rewards: {
        xp: number;
        coins: number;
        items?: string[];
    };
    requirements: {
        minLevel?: number;
        minOverall?: number;
    };
    imageUrl: string;
}

export const DISPATCH_MISSIONS: IDispatchMission[] = [
    {
        id: "m1",
        title: "Perimeter Patrol",
        description: "Standard patrol duty around the outer walls. Low risk, good for rookies.",
        difficulty: "D",
        duration: 30, // 30 seconds for demo
        rewards: {
            xp: 50,
            coins: 100
        },
        requirements: {
            minOverall: 60
        },
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440" // Placeholder
    },
    {
        id: "m2",
        title: "Forest Scouting",
        description: "Investigate reports of increased activity in the nearby forest sector.",
        difficulty: "C",
        duration: 60,
        rewards: {
            xp: 150,
            coins: 300
        },
        requirements: {
            minOverall: 70
        },
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440"
    },
    {
        id: "m3",
        title: "Supply Run",
        description: "Escort a supply convoy through dangerous territory.",
        difficulty: "B",
        duration: 120,
        rewards: {
            xp: 350,
            coins: 800
        },
        requirements: {
            minOverall: 80
        },
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440"
    },
    {
        id: "m4",
        title: "Boss Raid",
        description: "A high-threat target has been identified. Assemble an elite squad.",
        difficulty: "S",
        duration: 300,
        rewards: {
            xp: 1000,
            coins: 2500,
            items: ["Rare Chest"]
        },
        requirements: {
            minOverall: 90
        },
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440"
    }
];


export interface IFactionBuilderCriteria {
    type: 'min_total_stat' | 'min_card_stat' | 'rarity_count' | 'min_total_overall' | 'max_cards';
    target: 'attack' | 'defense' | 'speed' | 'intelligence' | 'overall' | 'count' | string;
    value: number;
    description: string;
}

export interface IFactionBuilderMission {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    criterias: IFactionBuilderCriteria[];
    rewards: {
        xp: number;
        coins: number;
        packId?: string;
    };
}

export const FACTION_BUILDER_MISSIONS: IFactionBuilderMission[] = [
    {
        id: "fb1",
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
        rewards: {
            xp: 100,
            coins: 200
        }
    },
    {
        id: "fb2",
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
        rewards: {
            xp: 300,
            coins: 600
        }
    },
    {
        id: "fb3",
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
        rewards: {
            xp: 500,
            coins: 1000,
            packId: "base-set"
        }
    },
    {
        id: "fb4",
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
        rewards: {
            xp: 1000,
            coins: 2000,
            packId: "premium-pack"
        }
    }
];


// For backward compatibility if needed, though we can refactor consumers to use DISPATCH_MISSIONS
export const MISSIONS = DISPATCH_MISSIONS;
export type IMission = IDispatchMission; // Alias for compatibility


