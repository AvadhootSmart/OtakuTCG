"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Coins, Layers, Package } from "lucide-react";
import { getMissions } from "@/api/missions";
import { IMission } from "@/types/mission";
import { DIFFICULTY_COLOR, EmptyState, GameShell, ScreenHeader } from "@/components/game-shell";

export default function FactionBuilderListPage() {
    const [missions, setMissions] = useState<IMission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMissions()
            .then(setMissions)
            .catch((error) => console.error("Failed to fetch missions:", error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <GameShell className="flex flex-col px-5 pt-6 md:px-10 md:pt-8">
            <ScreenHeader eyebrow="Faction Builder · Contracts" title="Mission board">
                <p className="max-w-sm text-sm text-muted-foreground">
                    Each contract lists criteria. Draft a squad of up to five that meets all of them.
                </p>
            </ScreenHeader>

            <div className="scroll-area fade-y -mx-5 mt-4 min-h-0 flex-1 px-5 pb-10 pt-4 md:mx-0 md:px-0">
                {loading ? (
                    <EmptyState title="Receiving contracts…" />
                ) : missions.length === 0 ? (
                    <EmptyState title="Board is empty" body="No missions available. Check back later." />
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {missions.map((mission, i) => {
                            const color = DIFFICULTY_COLOR[mission.difficulty] ?? "#a1a1aa";
                            const RewardIcon = mission.rewardType === "coins" ? Coins : mission.rewardType === "pack" ? Package : Layers;
                            return (
                                <motion.div
                                    key={mission._id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: Math.min(i, 9) * 0.05, ease: [0.32, 0.72, 0, 1] }}
                                >
                                    <Link href={`/play/faction-builder/${mission._id}`} className="plate [--c:14px] group flex h-full flex-col p-5 transition-transform duration-500 ease-snap hover:-translate-y-1">
                                        <span className="absolute inset-y-4 left-0 w-[3px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
                                        <div className="flex items-center justify-between">
                                            <span className="font-display text-xs font-bold uppercase tracking-[0.25em]" style={{ color }}>
                                                {mission.difficulty}
                                            </span>
                                            <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                {mission.criterias.length} criteria
                                            </span>
                                        </div>
                                        <h3 className="mt-4 font-display text-3xl font-extrabold uppercase italic leading-[0.95]">{mission.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{mission.description}</p>

                                        <ul className="mt-5 flex-1 space-y-2 border-t border-white/[0.06] pt-4">
                                            {mission.criterias.map((c, j) => (
                                                <li key={j} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                                                    <span className="mt-1.5 size-1.5 shrink-0 rotate-45" style={{ background: color }} />
                                                    {c.description}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4 font-display text-sm font-bold uppercase tracking-[0.12em]">
                                                <span className="flex items-center gap-1.5">
                                                    <RewardIcon className="size-4 text-gold" strokeWidth={1.5} />
                                                    {mission.rewardType === "coins" ? mission.rewardCoins : `1 ${mission.rewardType}`}
                                                </span>
                                                <span className="text-muted-foreground">+{mission.rewardXp} XP</span>
                                            </div>
                                            <span className="chamfer [--c:6px] grid size-9 place-items-center bg-gold/10 text-gold transition-transform duration-500 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                                                <ArrowUpRight className="size-4" strokeWidth={1.5} />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </GameShell>
    );
}
