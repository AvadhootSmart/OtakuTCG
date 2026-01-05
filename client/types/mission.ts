export interface IMissionCriteria {
    type: 'min_total_stat' | 'min_card_stat' | 'rarity_count' | 'min_total_overall' | 'max_cards';
    target: 'attack' | 'defense' | 'speed' | 'intelligence' | 'overall' | 'count' | string;
    value: number;
    description: string;
}

export interface IMission {
    _id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    criterias: IMissionCriteria[];
    rewardType: "card" | "pack" | "coins";
    rewardCoins?: number;
    rewardCardId?: string;
    rewardPackId?: string;
    rewardXp: number;
    createdAt: string;
    updatedAt: string;
}
