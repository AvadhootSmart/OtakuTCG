import { TradingCardProps } from "@/components/TradingCard";

export const cards: TradingCardProps[] = [
    {
        id: "gojo-satoru",
        name: "Gojo Satoru",
        overall: 89,
        rarity: "legendary",
        imageUrl: "gojo.gif",
        attributes: {
            attack: 94,
            defense: 82,
            speed: 88,
            intelligence: 85,
        }
    },
    {
        id: "levi-ackerman",
        name: "Levi Ackerman",
        overall: 85,
        rarity: "epic",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        attributes: {
            attack: 88,
            defense: 75,
            speed: 95,
            intelligence: 90,
        }
    },
    {
        id: "guts",
        name: "Guts",
        overall: 92,
        rarity: "rare",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        attributes: {
            attack: 96,
            defense: 94,
            speed: 70,
            intelligence: 80,
        }
    },
    {
        id: "rock-lee",
        name: "Rock Lee",
        overall: 78,
        rarity: "common",
        imageUrl: "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
        attributes: {
            attack: 84,
            defense: 70,
            speed: 92,
            intelligence: 65,
        }
    }
];
