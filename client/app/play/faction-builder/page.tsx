"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMissions } from "@/api/missions";
import { IMission } from "@/types/mission";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Users, Loader2, Package, Coins, LayoutGrid } from "lucide-react";

export default function FactionBuilderListPage() {
    const [missions, setMissions] = useState<IMission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const data = await getMissions();
                setMissions(data);
            } catch (error) {
                console.error("Failed to fetch missions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

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
                {missions.map((mission) => (
                    <div key={mission._id} className="group bg-card border rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col">
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${mission.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    mission.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        mission.difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {mission.difficulty}
                                </span>
                                {mission.rewardType !== 'coins' && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${mission.rewardType === 'pack' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {mission.rewardType === 'pack' ? 'Pack Reward' : 'Card Reward'}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{mission.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{mission.description}</p>
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
                                <span className="flex items-center gap-1">
                                    {mission.rewardType === 'coins' ? <Coins className="w-3 h-3 text-yellow-500" /> :
                                        mission.rewardType === 'pack' ? <Package className="w-3 h-3 text-purple-500" /> :
                                            <LayoutGrid className="w-3 h-3 text-amber-500" />}
                                    {mission.rewardType === 'coins' ? mission.rewardCoins : '1x'}
                                </span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-500" /> {mission.rewardXp} XP</span>
                            </div>
                            <Button asChild>
                                <Link href={`/play/faction-builder/${mission._id}`}>Start Mission</Link>
                            </Button>
                        </div>
                    </div>
                ))}

                {missions.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground text-sm font-medium">No missions available. Check back later!</p>
                    </div>
                )}
            </main>
        </div>
    );
}