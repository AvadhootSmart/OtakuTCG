"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
import { EmptyState, GameShell, RARITY_COLOR, RARITY_ORDER, ScreenHeader } from "@/components/game-shell";
import { getCards } from "@/api/cards";
import { ICard } from "@/types/card";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "legendary", "epic", "rare", "common"] as const;

export default function ShowcasePage() {
    const [cards, setCards] = useState<ICard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
    const [query, setQuery] = useState("");

    useEffect(() => {
        getCards()
            .then(setCards)
            .catch((err: any) => setError(err.response?.data?.error || "Failed to fetch cards"))
            .finally(() => setIsLoading(false));
    }, []);

    const visible = cards
        .filter((c) => (filter === "all" || c.rarity === filter) && c.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || b.overall - a.overall);

    return (
        <GameShell className="flex flex-col px-5 pt-6 md:px-10 md:pt-8">
            <ScreenHeader eyebrow={`Codex · ${cards.length} cards`} title="Every card">
                <label className="plate [--c:8px] flex h-10 w-full items-center gap-2 px-3 sm:w-64">
                    <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </label>
            </ScreenHeader>

            <div className="scroll-x -mx-5 mt-5 flex shrink-0 gap-1 border-b border-white/[0.06] px-5 md:mx-0 md:px-0">
                {FILTERS.map((f) => {
                    const count = f === "all" ? cards.length : cards.filter((c) => c.rarity === f).length;
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 font-display text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-500",
                                filter === f ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {f !== "all" && <span className="size-1.5 rotate-45" style={{ background: RARITY_COLOR[f] }} />}
                            {f}
                            <span className="text-xs tabular-nums opacity-50">{count}</span>
                            <span
                                className={cn(
                                    "absolute inset-x-2 -bottom-px h-[2px] transition-transform duration-500 ease-snap",
                                    filter === f ? "scale-x-100" : "scale-x-0",
                                )}
                                style={{ background: f === "all" ? "var(--gold)" : RARITY_COLOR[f] }}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="scroll-area fade-y -mx-5 min-h-0 flex-1 px-5 pb-10 pt-6 md:mx-0 md:px-0">
                {isLoading ? (
                    <EmptyState title="Loading codex…" />
                ) : error ? (
                    <EmptyState title="Codex unavailable" body={error} />
                ) : visible.length === 0 ? (
                    <EmptyState title="No cards" body="Nothing matches this filter." />
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] justify-items-center gap-x-3 gap-y-6 md:grid-cols-[repeat(auto-fill,minmax(216px,1fr))]">
                        {visible.map((card, i) => (
                            <motion.div
                                key={card._id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: Math.min(i, 12) * 0.04, ease: [0.32, 0.72, 0, 1] }}
                                className="[zoom:0.52] md:[zoom:0.75]"
                            >
                                <div className="transition-transform duration-500 ease-snap hover:-translate-y-2">
                                    <TradingCard {...card} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </GameShell>
    );
}
