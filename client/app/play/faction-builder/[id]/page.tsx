"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios.config";
import { IUserProfile } from "@/types/user";
import { ICard } from "@/types/card";
import { Loader2, Shield, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { DIFFICULTY_COLOR, EmptyState, GameShell } from "@/components/game-shell";
import { CardPicker, SquadSlots, SquadTotals } from "@/components/squad";
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
            <GameShell>
                <EmptyState title="Loading contract…" />
            </GameShell>
        );
    }

    if (!profile) {
        return (
            <GameShell>
                <EmptyState
                    title="Profile not found"
                    body="Sign in to draft a squad."
                    action={<Link href="/" className="btn btn-gold h-11 px-6 text-sm">Go to lobby</Link>}
                />
            </GameShell>
        );
    }

    const color = DIFFICULTY_COLOR[mission.difficulty] ?? "#a1a1aa";
    const statuses = mission.criterias.map((c) => ({ c, ...getCriteriaStatus(c) }));
    const metCount = statuses.filter((s) => s.met).length;

    return (
        <GameShell className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Collection */}
            <section className="flex min-h-0 flex-1 flex-col px-5 pt-5 md:px-10 md:pt-8">
                <div className="shrink-0">
                    <Link href="/play/faction-builder" className="eyebrow inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Mission board
                    </Link>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                        <div className="min-w-0">
                            <div className="eyebrow" style={{ color }}>{mission.difficulty} contract</div>
                            <h1 className="font-display text-4xl font-extrabold uppercase italic leading-[0.9] md:text-5xl">{mission.title}</h1>
                        </div>
                        <span className="eyebrow text-muted-foreground">{profile.ownedCards.length} owned</span>
                    </div>
                    <p className="mt-2 hidden max-w-2xl text-sm text-muted-foreground md:block">{mission.description}</p>
                </div>

                <div className="scroll-area fade-y -mx-5 mt-2 min-h-0 flex-1 px-5 pb-10 pt-5 md:mx-0 md:px-0">
                    {profile.ownedCards.length === 0 ? (
                        <EmptyState
                            title="No cards yet"
                            body="You need cards to draft a squad."
                            action={<Link href="/marketplace" className="btn btn-gold h-11 px-6 text-sm">Visit store</Link>}
                        />
                    ) : (
                        <CardPicker
                            owned={profile.ownedCards}
                            isPicked={(card) => faction.some((c) => c._id === card._id)}
                            onToggle={(card) =>
                                faction.some((c) => c._id === card._id) ? removeFromFaction(card._id) : addToFaction(card)
                            }
                        />
                    )}
                </div>
            </section>

            {/* Squad + criteria */}
            <aside className="flex shrink-0 flex-col gap-4 border-t border-white/[0.06] bg-[#0a0a0f]/80 p-4 lg:min-h-0 lg:gap-6 lg:border-l lg:border-t-0 lg:p-6">
                <div className="flex items-center justify-between">
                    <div className="font-display text-2xl font-extrabold uppercase italic">
                        Squad <span className="text-gold tabular-nums">{faction.length}</span>
                        <span className="text-muted-foreground">/{MAX_FACTION_SIZE}</span>
                    </div>
                    {faction.length > 0 && (
                        <button onClick={() => setFaction([])} className="eyebrow text-muted-foreground transition-colors hover:text-destructive">
                            Clear
                        </button>
                    )}
                </div>

                <div className="scroll-area flex min-h-0 flex-col gap-6 lg:flex-1">
                    <SquadSlots cards={faction} max={MAX_FACTION_SIZE} onRemove={removeFromFaction} />
                    <div className="hidden lg:block">
                        <SquadTotals cards={faction} />
                    </div>
                    <div className="hidden lg:block">
                        <div className="eyebrow mb-3 text-muted-foreground">Criteria · {metCount}/{statuses.length}</div>
                        <ul className="space-y-2">
                            {statuses.map(({ c, met, progressText }, i) => (
                                <li
                                    key={i}
                                    className={`flex items-start gap-3 border-l-2 py-1.5 pl-3 transition-colors duration-500 ${met ? "border-emerald-400 bg-emerald-400/[0.06]" : "border-white/10"}`}
                                >
                                    {met ? (
                                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
                                    ) : (
                                        <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                                    )}
                                    <div className="min-w-0 text-[13px]">
                                        <div className={met ? "text-foreground" : "text-foreground/70"}>{c.description}</div>
                                        <div className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{progressText}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button
                    onClick={handleCompleteMission}
                    disabled={!allCriteriaMet || isSubmitting}
                    className="btn btn-gold h-12 w-full shrink-0 text-base"
                >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" strokeWidth={1.75} />}
                    {isSubmitting ? "Deploying…" : allCriteriaMet ? "Complete mission" : `${metCount}/${statuses.length} criteria met`}
                </button>
            </aside>
        </GameShell>
    );
}
