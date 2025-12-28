"use client";

import { Star, Shield, Target, Zap, Heart, Eye } from "lucide-react";

export interface CardAttributes {
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
    health: number;
    energy: number;
}

export interface TradingCardProps {
    id: string;
    name?: string;
    overall?: number;
    attributes?: CardAttributes;
    imageUrl?: string;
    rarity?: "common" | "rare" | "epic" | "legendary";
}

export function TradingCard({
    name = "Eren Yeager",
    overall = 87,
    attributes = {
        attack: 85,
        defense: 72,
        speed: 78,
        intelligence: 82,
        health: 88,
        energy: 75
    },
    imageUrl = "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440",
    rarity = "legendary",
}: TradingCardProps) {

    const rarityStyles = {
        common: {
            border: "border-slate-400/50",
            bg: "bg-slate-100 dark:bg-slate-900",
            gradient: "from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-950",
            accent: "text-slate-600 dark:text-slate-400",
            text: "text-slate-900 dark:text-slate-100",
            glow: "shadow-slate-500/20"
        },
        rare: {
            border: "border-blue-500/50",
            bg: "bg-blue-50 dark:bg-blue-950",
            gradient: "from-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-950",
            accent: "text-blue-600 dark:text-blue-400",
            text: "text-blue-900 dark:text-blue-100",
            glow: "shadow-blue-500/30"
        },
        epic: {
            border: "border-purple-500/50",
            bg: "bg-purple-50 dark:bg-purple-950",
            gradient: "from-purple-400 to-purple-600 dark:from-purple-900 dark:to-purple-950",
            accent: "text-purple-600 dark:text-purple-400",
            text: "text-purple-900 dark:text-purple-100",
            glow: "shadow-purple-500/40"
        },
        legendary: {
            border: "border-amber-400/60",
            bg: "bg-amber-50 dark:bg-amber-950",
            gradient: "from-amber-300 via-amber-500 to-amber-600 dark:from-amber-700 dark:via-amber-800 dark:to-amber-950",
            accent: "text-amber-600 dark:text-amber-400",
            text: "text-amber-900 dark:text-amber-100",
            glow: "shadow-amber-500/50"
        }
    };

    const style = rarityStyles[rarity];

    return (
        <div className={`relative w-72 h-104 rounded-2xl border-4 ${style.border} ${style.bg} ${style.glow} shadow-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:-translate-y-1`}>
            {/* Background Texture/Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-20 dark:opacity-40 transition-opacity`} />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

            {/* Character Image - Now starts from the very top */}
            <div className="absolute top-0 left-0 w-full h-[70%] z-0">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover object-top filter contrast-110 brightness-110 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient to smooth image transition into bottom section */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>

            {/* Header Overlay: Name and Rating */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10">
                <div className="px-3 py-1 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg shadow-sm border border-white/10">
                    <h3 className={`text-lg font-black tracking-tight rock-salt ${style.text}`}>
                        {name}
                    </h3>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg shadow-sm border border-white/10">
                    <span className={`text-3xl font-black leading-none ${style.text}`}>{overall}</span>
                    <span className={`text-[8px] font-black uppercase tracking-tighter opacity-70 ${style.text}`}>OVR</span>
                </div>
            </div>

            {/* Bottom Info Section */}
            <div className="absolute bottom-4 left-0 w-full px-4 z-10">
                <div className={`w-full grid grid-cols-2 gap-x-6 gap-y-2 py-3 px-4 bg-white/10 dark:bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl`}>
                    {[
                        { label: "ATK", val: attributes.attack },
                        { label: "INT", val: attributes.intelligence },
                        { label: "DEF", val: attributes.defense },
                        { label: "HP", val: attributes.health },
                        { label: "SPD", val: attributes.speed },
                        { label: "ENG", val: attributes.energy }
                    ].map((stat) => (
                        <div key={stat.label} className="flex justify-between items-center group/stat">
                            <span className={`text-[10px] font-black uppercase tracking-wider opacity-70 ${style.text}`}>{stat.label}</span>
                            <span className={`text-base font-black tracking-tight ${style.text}`}>{stat.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Holographic Shine */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine pointer-events-none z-30" />
        </div>
    );
}
