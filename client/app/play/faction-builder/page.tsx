"use client";

import Link from "next/link";
import { FACTION_BUILDER_MISSIONS } from "@/static_data/missions";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Users } from "lucide-react";

export default function FactionBuilderListPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <header className="max-w-6xl mx-auto mb-12 mt-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black rock-salt tracking-tighter">Faction Builder</h1>
                        <p className="text-muted-foreground">Assemble custom teams to meet specific operational criteria.</p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FACTION_BUILDER_MISSIONS.map((mission) => (
                    <div key={mission.id} className="group bg-card border rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col">
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${mission.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        mission.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {mission.difficulty}
                                </span>
                                {mission.rewards.packId && (
                                    <span className="text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-full">
                                        Pack Reward
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{mission.title}</h3>
                                <p className="text-sm text-muted-foreground">{mission.description}</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Criteria:</p>
                                <ul className="space-y-1">
                                    {mission.criterias.map((c, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2 text-slate-300">
                                            <span className="mt-1 w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                                            {c.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> {mission.rewards.coins}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-500" /> {mission.rewards.xp} XP</span>
                            </div>
                            <Button asChild>
                                <Link href={`/play/faction-builder/${mission.id}`}>Start Mission</Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}