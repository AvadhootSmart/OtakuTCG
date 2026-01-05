"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios.config";
import { IUserProfile } from "@/types/user";
import { ICard } from "@/types/card";
import { TradingCard } from "@/components/TradingCard";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Sword, Zap, Brain, LayoutGrid, Plus, Minus, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getMissionById, completeMission } from "@/api/missions";
import { IMission, IMissionCriteria } from "@/types/mission";

export default function FactionMissionPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [faction, setFaction] = useState<ICard[]>([]);
    const [mission, setMission] = useState<IMission | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Limits
    const MAX_FACTION_SIZE = 5;

    useEffect(() => {
        const fetchMissionAndProfile = async () => {
            try {
                const missionId = params.id as string;
                const foundMission = await getMissionById(missionId);
                setMission(foundMission);
                await fetchProfile();
            } catch (error) {
                console.error("Failed to fetch mission", error);
                toast.error("Mission not found");
                router.push("/play/faction-builder");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMissionAndProfile();
    }, [params.id, router]);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/user/profile");
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load collection");
        }
    };

    const addToFaction = (card: ICard) => {
        if (faction.length >= MAX_FACTION_SIZE) {
            toast.error(`Faction is full! Max ${MAX_FACTION_SIZE} cards.`);
            return;
        }
        if (faction.some(c => c._id === card._id)) {
            toast.error("Card is already in your faction!");
            return;
        }
        setFaction([...faction, card]);
    };

    const removeFromFaction = (cardId: string) => {
        setFaction(faction.filter(c => c._id !== cardId));
    };

    // Derived Stats
    const totalStats = faction.reduce((acc, card) => {
        return {
            attack: acc.attack + card.attributes.attack,
            defense: acc.defense + card.attributes.defense,
            speed: acc.speed + card.attributes.speed,
            intelligence: acc.intelligence + card.attributes.intelligence,
            overall: acc.overall + card.overall
        };
    }, { attack: 0, defense: 0, speed: 0, intelligence: 0, overall: 0 });

    const avgOverall = faction.length > 0 ? Math.round(totalStats.overall / faction.length) : 0;

    // Validation Logic
    const getCriteriaStatus = (criteria: IMissionCriteria) => {
        let current = 0;
        let target = criteria.value;
        let met = false;
        let progressText = "";

        switch (criteria.type) {
            case 'min_total_stat': {
                const targetStat = criteria.target as keyof typeof totalStats;
                current = (targetStat in totalStats) ? totalStats[targetStat] : 0;
                met = current >= target;
                progressText = `${current}/${target}`;
                break;
            }
            case 'min_card_stat': {
                const targetAttribute = criteria.target as keyof ICard['attributes'];
                const validCardsCount = faction.filter(c => c.attributes[targetAttribute] >= criteria.value).length;
                current = validCardsCount;
                target = faction.length > 0 ? faction.length : 0;
                met = faction.length > 0 && validCardsCount === faction.length;
                progressText = `${validCardsCount}/${Math.max(1, faction.length)} Units`;
                break;
            }
            case 'max_cards':
                current = faction.length;
                met = current > 0 && current <= target;
                progressText = `${current}/${target} Count`;
                break;
            case 'rarity_count':
                const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
                const targetIdx = rarities.indexOf(criteria.target as string);
                const validCards = faction.filter(c => {
                    const idx = rarities.indexOf(c.rarity);
                    return idx >= targetIdx;
                });
                current = validCards.length;
                met = current >= target;
                progressText = `${current}/${target} Cards`;
                break;
            case 'min_total_overall':
                current = totalStats.overall;
                met = current >= target;
                progressText = `${current}/${target}`;
                break;
            default:
                met = false;
        }
        return { met, progressText };
    };

    const allCriteriaMet = mission ? mission.criterias.every(c => getCriteriaStatus(c).met) : false;

    const handleCompleteMission = async () => {
        if (!allCriteriaMet || !mission) {
            toast.error("Mission criteria not met!");
            return;
        }

        setIsSubmitting(true);
        try {
            const cardIds = faction.map(c => c._id);
            const response = await completeMission(mission._id, cardIds);

            toast.success(response.message || `Mission "${mission.title}" Completed!`);

            setTimeout(() => {
                router.push("/play/faction-builder");
            }, 1500);
        } catch (error: any) {
            console.error("Failed to complete mission:", error);
            toast.error(error.response?.data?.error || "Failed to complete mission");
            setIsSubmitting(false);
        }
    };

    if (isLoading || !mission) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                <Button asChild>
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="bg-card border-b p-6 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="mr-2">
                            <Link href="/play/faction-builder"><ArrowLeft className="w-5 h-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                {mission.title}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${mission.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    mission.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        mission.difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {mission.difficulty}
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground">{mission.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Quick Stats Dashboard */}
                        <div className="hidden md:flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-400">
                                <Sword className="w-4 h-4" /> {totalStats.attack}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-400">
                                <Shield className="w-4 h-4" /> {totalStats.defense}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-yellow-400">
                                <Zap className="w-4 h-4" /> {totalStats.speed}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
                                <Brain className="w-4 h-4" /> {totalStats.intelligence}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCompleteMission}
                                disabled={!allCriteriaMet || isSubmitting}
                                className={allCriteriaMet ? "bg-green-600 hover:bg-green-700 text-white" : "opacity-50"}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                    allCriteriaMet ? <CheckCircle className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                                {isSubmitting ? "Completing..." : "Complete Mission"}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">

                {/* Left: Card Collection */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {mission.criterias.map((c, i) => {
                                const { met, progressText } = getCriteriaStatus(c);
                                return (
                                    <div key={i} className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 ${met ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                        {met ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        <span className="font-medium mr-1">{progressText}</span>
                                        <span className="opacity-80">{c.description}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <span className="text-xs text-muted-foreground uppercase font-bold bg-muted px-2 py-1 rounded">
                            {profile.ownedCards.length} Owned
                        </span>
                    </div>

                    {profile.ownedCards.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                            <p className="text-muted-foreground mb-4">You don't own any cards yet.</p>
                            <Button asChild>
                                <Link href="/#store">Visit Store</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {profile.ownedCards.map((ownership, index) => {
                                const card = ownership.cardId;
                                if (!card) return null;
                                const isInFaction = faction.some(c => c._id === card._id);

                                return (
                                    <div key={index} className="relative group">
                                        <div className={`transition-all duration-300 ${isInFaction ? "opacity-40 grayscale scale-95" : "hover:scale-105"}`}>
                                            <div className="origin-top-left scale-[0.85] w-[288px] h-[416px] mb-[-60px] mr-[-40px]">
                                                <TradingCard
                                                    id={card._id}
                                                    name={card.name}
                                                    overall={card.overall}
                                                    rarity={card.rarity}
                                                    imageUrl={card.imageUrl}
                                                    attributes={card.attributes}
                                                />
                                            </div>
                                        </div>
                                        {!isInFaction && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <Button size="lg" className="shadow-2xl font-bold" onClick={() => addToFaction(card)}>
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Add
                                                </Button>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-12 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20 z-20">
                                            x{ownership.count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Current Faction (Sticky Sidebar) */}
                <div className="xl:sticky xl:top-28 h-fit space-y-6">
                    <div className="bg-card border rounded-xl shadow-xl overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                Active Squad
                            </h3>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-red-400 hover:text-red-500" onClick={() => setFaction([])}>
                                Clear All
                            </Button>
                        </div>

                        <div className="p-4 space-y-3 min-h-[300px]">
                            {faction.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12 border-2 border-dashed border-white/10 rounded-lg">
                                    <Shield className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Your squad is empty.</p>
                                    <p className="text-xs opacity-50">Select cards from your collection</p>
                                </div>
                            ) : (
                                faction.map((card) => (
                                    <div key={card._id} className="group relative flex items-center gap-3 bg-muted/40 p-2 rounded-lg border border-transparent hover:border-white/10 hover:bg-muted/60 transition-all animate-in slide-in-from-right-2">
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-black flex-shrink-0 relative">
                                            <Image src={card.imageUrl} className="object-cover object-top" alt={card.name} fill sizes="48px" />
                                            <div className="absolute inset-0 ring-1 ring-inset ring-black/20" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{card.name}</h4>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold">
                                                <span className={`
                                                    ${card.rarity === 'legendary' ? 'text-amber-500' :
                                                        card.rarity === 'epic' ? 'text-purple-500' :
                                                            card.rarity === 'rare' ? 'text-blue-500' : 'text-slate-500'}
                                                `}>{card.rarity}</span>
                                                <span>OVR {card.overall}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => removeFromFaction(card._id)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {Array.from({ length: Math.max(0, MAX_FACTION_SIZE - faction.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-16 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-bold text-white/10 uppercase tracking-widest">Empty Slot</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
