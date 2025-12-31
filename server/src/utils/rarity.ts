export const RARITY_WEIGHTS = {
    common: 50,
    rare: 25,
    epic: 10,
    legendary: 5
} as const;

export type RarityType = keyof typeof RARITY_WEIGHTS;

export const getEffectiveWeight = (rarity: string, cardWeight: number = 1) => {
    const base = RARITY_WEIGHTS[rarity.toLowerCase() as RarityType] || 100;
    return base * cardWeight;
};

export const calculatePackProbabilities = (cards: any[]) => {
    const totalWeight = cards.reduce((sum: number, c: any) =>
        sum + getEffectiveWeight(c.rarity, c.weight || 1), 0);

    const rarityGroups: Record<string, { weight: number, color: string }> = {
        "common": { weight: 0, color: "#94a3b8" },
        "rare": { weight: 0, color: "#3b82f6" },
        "epic": { weight: 0, color: "#a855f7" },
        "legendary": { weight: 0, color: "#f59e0b" }
    };

    cards.forEach((c: any) => {
        const rarity = c.rarity.toLowerCase();
        if (rarityGroups[rarity]) {
            rarityGroups[rarity].weight += getEffectiveWeight(c.rarity, c.weight || 1);
        }
    });

    if (totalWeight === 0) return [];

    return Object.entries(rarityGroups)
        .filter(([_, data]) => data.weight > 0)
        .map(([rarity, data]) => ({
            rarity: rarity.charAt(0).toUpperCase() + rarity.slice(1),
            chance: Number(((data.weight / totalWeight) * 100).toFixed(1)),
            color: data.color
        }));
};

export const drawCardFromPack = (cards: any[]) => {
    const totalWeight = cards.reduce((sum: number, c: any) =>
        sum + getEffectiveWeight(c.rarity, c.weight || 1), 0);

    let random = Math.random() * totalWeight;

    for (const card of cards) {
        const cardWeight = getEffectiveWeight(card.rarity, card.weight || 1);
        if (random < cardWeight) {
            return card;
        }
        random -= cardWeight;
    }

    return cards[0]; // Fallback
};
