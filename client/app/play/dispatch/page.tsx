"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/axios.config";
import { IUserProfile } from "@/types/user";
import { ICard } from "@/types/card";
import { TradingCard } from "@/components/TradingCard";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Sword, Zap, Brain, MapPin, Clock, AlertTriangle, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Game Definitions ---

type GameState = "SELECTION" | "PLAYING" | "GAME_OVER";

interface DispatchEvent {
    id: string;
    title: string;
    description: string; // The hint
    type: "combat" | "intel" | "stealth" | "defense"; // Hidden type mapping to stats
    difficulty: number; // Multiplier for stat requirements
    position: { top: number; left: number }; // Map coordinates %
    duration: number; // How long the mission takes to complete
    expiresAt: number; // When the event disappears if not taken
    status: "active" | "in-progress" | "completed" | "expired" | "failed";
    assignedCardId?: string;
    startTime?: number;
}

const EVENT_TEMPLATES = [
    { title: "Rampaging Beast", description: "A massive creature is destroying the outer walls. We need brute force!", type: "combat" },
    { title: "Firewall Breach", description: "Decrypt the enemy communications before they change the codes.", type: "intel" },
    { title: "Supply Run", description: "Deliver urgent medical supplies to the front lines. Speed is of the essence.", type: "stealth" }, // Maps to Speed
    { title: "Civilian Escort", description: "Protect the VIPs moving through the warzone. Ensure no harm comes to them.", type: "defense" },
    { title: "Tactical Ambush", description: "The enemy is flanking. We need a smart counter-strategy.", type: "intel" },
    { title: "Duel Request", description: "An enemy commander has issued a challenge. Send your strongest duelest.", type: "combat" },
    { title: "Infiltration", description: "Sneak into the base undetected and disable the alarms.", type: "stealth" },
    { title: "Hold the Line", description: "They remain fortified until reinforcements arrive!", type: "defense" },
];

export default function DispatchGamePage() {
    const [gameState, setGameState] = useState<GameState>("SELECTION");
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [squad, setSquad] = useState<ICard[]>([]);
    const [events, setEvents] = useState<DispatchEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());
    const [score, setScore] = useState(0);

    // Constants
    const MAX_SQUAD_SIZE = 5;
    const GAME_DURATION = 1000 * 60 * 3; // 3 minute round (not strictly implemented yet, just endless mode for prototype)

    // Refs for intervals to clear them
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchProfile();
        // Clock tick
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Game Loop ---
    useEffect(() => {
        if (gameState === "PLAYING") {
            gameLoopRef.current = setInterval(() => {
                spawnEventLogic();
            }, 5000); // Try to spawn event every 5s
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
    }, [gameState]); // Removed 'events' dependency to prevent timer reset

    const fetchProfile = async () => {
        try {
            const res = await api.get("/user/profile");
            setProfile(res.data);
        } catch (error) {
            toast.error("Failed to load profile");
        }
    };

    // --- Logic: Spawning ---
    const spawnEventLogic = () => {
        setEvents(prev => {
            // Cleanup old expired
            const cleanEvents = prev.filter(e => {
                if (e.status === 'completed' || e.status === 'failed') return Date.now() - (e.startTime || 0) < 5000; // Keep finished events briefly
                if (e.status === 'active' && e.expiresAt < Date.now()) return false;
                return true;
            });

            if (cleanEvents.length >= 4) return cleanEvents; // Cap active events

            const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
            const id = Math.random().toString(36).substring(7);
            const difficulty = Math.floor(Math.random() * 3) + 1; // 1-3

            const newEvent: DispatchEvent = {
                id,
                title: template.title,
                description: template.description,
                type: template.type as any,
                difficulty,
                position: {
                    top: 20 + Math.random() * 60, // 20-80%
                    left: 10 + Math.random() * 80  // 10-90%
                },
                duration: 10000 * difficulty, // 10s base * diff
                expiresAt: Date.now() + 30000, // 30s to accept
                status: "active"
            };
            return [...cleanEvents, newEvent];
        });
    };

    // --- Logic: Dispatching ---
    const handleDispatch = (card: ICard) => {
        if (!selectedEventId) return;

        setEvents(prev => prev.map(ev => {
            if (ev.id === selectedEventId && ev.status === "active") {
                return {
                    ...ev,
                    status: "in-progress",
                    assignedCardId: card._id,
                    startTime: Date.now()
                };
            }
            return ev;
        }));
        setSelectedEventId(null);
        toast.info(`${card.name} dispatched!`);
    };

    // --- Logic: Resolution (Tick Check) ---
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        setEvents(prev => prev.map(ev => {
            if (ev.status === "in-progress" && ev.startTime) {
                const elapsed = now - ev.startTime;
                if (elapsed >= ev.duration) {
                    // Mission Finished - Calculate Result
                    const card = squad.find(c => c._id === ev.assignedCardId);
                    if (!card) return { ...ev, status: "failed" }; // Should not happen

                    // Determine stat based on type
                    let statValue = 0;
                    switch (ev.type) {
                        case 'combat': statValue = card.attributes.attack; break;
                        case 'defense': statValue = card.attributes.defense; break;
                        case 'stealth': statValue = card.attributes.speed; break; // Speed for stealth/supply
                        case 'intel': statValue = card.attributes.intelligence; break;
                    }

                    // Difficulty check (random logic)
                    const requirement = ev.difficulty * 50; // Simple balancing
                    const success = statValue >= requirement;

                    if (success) {
                        setScore(s => s + (ev.difficulty * 100));
                        if (Math.random() > 0.7) toast.success(`Mission Success! +${ev.difficulty * 100} PTS`);
                        return { ...ev, status: "completed" };
                    } else {
                        if (Math.random() > 0.7) toast.error("Mission Failed! Unit was overwhelmed.");
                        return { ...ev, status: "failed" };
                    }
                }
            }
            return ev;
        }));
    }, [now, gameState, squad]);


    // --- Selection State ---
    const toggleSquadSelection = (card: ICard) => {
        if (squad.find(c => c._id === card._id)) {
            setSquad(squad.filter(c => c._id !== card._id));
        } else {
            if (squad.length >= MAX_SQUAD_SIZE) {
                toast.error("Squad full!");
                return;
            }
            setSquad([...squad, card]);
        }
    };

    if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    // --- RENDER: SELECTION ---
    if (gameState === "SELECTION") {
        return (
            <div className="min-h-screen bg-background p-6 pb-20">
                <div className="max-w-7xl mx-auto space-y-6">
                    <header className="flex justify-between items-center bg-card p-6 rounded-xl border">
                        <div>
                            <h1 className="text-3xl font-black rock-salt">Dispatch Ops</h1>
                            <p className="text-muted-foreground">Select {MAX_SQUAD_SIZE} agents for the operation.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xl font-bold">
                                {squad.length}/{MAX_SQUAD_SIZE} Selected
                            </div>
                            <Button
                                size="lg"
                                disabled={squad.length !== MAX_SQUAD_SIZE}
                                onClick={() => setGameState("PLAYING")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Start Operation
                            </Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                        {profile.ownedCards.map((ownership) => {
                            const card = ownership.cardId;
                            if (!card) return null;
                            const isSelected = squad.some(c => c._id === card._id);

                            return (
                                <div key={card._id} className="relative cursor-pointer group" onClick={() => toggleSquadSelection(card)}>
                                    <div className={`transition-all duration-200 active:scale-105 ${isSelected ? "opacity-100" : "opacity-40 hover:opacity-100"}`}>
                                        <TradingCard {...card} id={card._id} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: PLAYING ---
    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">

            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
                <div className="bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl text-white pointer-events-auto">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Operation Score</h2>
                    <div className="text-4xl font-mono font-black text-amber-500 w-[200px]">{score.toLocaleString()}</div>
                </div>
                <Button variant="destructive" size="sm" className="pointer-events-auto" onClick={() => {
                    setGameState("SELECTION");
                    setEvents([]);
                    setScore(0);
                }}>
                    ABORT MISSION
                </Button>
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative bg-[url('https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg')] bg-cover bg-center opacity-50">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Events */}
                {events.map((ev) => {
                    // Render Event Node
                    if (ev.status === "completed" || ev.status === "failed") return null;

                    const isSelected = selectedEventId === ev.id;
                    const timeLeft = Math.max(0, ev.expiresAt - now);
                    const progress = ev.status === "in-progress" && ev.startTime
                        ? ((now - ev.startTime) / ev.duration) * 100
                        : 0;

                    return (
                        <div
                            key={ev.id}
                            className={cn(
                                "absolute w-48 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10",
                                isSelected ? "scale-110 z-20" : "hover:scale-105"
                            )}
                            style={{ top: `${ev.position.top}%`, left: `${ev.position.left}%` }}
                            onClick={() => ev.status === "active" && setSelectedEventId(ev.id)}
                        >
                            {/* Marker Icon */}
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-slate-900",
                                    ev.status === "in-progress" ? "border-blue-500 animate-pulse" :
                                        ev.status === "active" ? "border-red-500 animate-bounce" : "border-gray-500"
                                )}>
                                    {ev.status === "in-progress" ? <RotateCcw className="w-6 h-6 text-blue-500 animate-spin" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                                </div>

                                {/* Info Box */}
                                <div className="mt-2 bg-black/90 text-white p-3 rounded-lg border border-white/20 text-center w-full shadow-xl">
                                    <div className="text-xs font-bold text-amber-500 uppercase mb-1">{ev.type} /// Diff: {ev.difficulty}</div>
                                    <div className="text-sm font-bold leading-tight mb-1">{ev.title}</div>

                                    {ev.status === "active" && (
                                        <div className="text-[10px] text-gray-400 italic mb-2 px-1">"{ev.description}"</div>
                                    )}

                                    {ev.status === "active" && (
                                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-1">
                                            <div className="bg-red-500 h-full" style={{ width: `${(timeLeft / 30000) * 100}%` }} />
                                        </div>
                                    )}

                                    {ev.status === "in-progress" && (
                                        <div className="w-full space-y-1">
                                            <div className="flex justify-between text-[10px] uppercase font-mono">
                                                <span>Deploying...</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-1.5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Bottom Deck (Squad) */}
            <div className="bg-black/90 border-t border-white/10 p-4 z-40 relative">
                <div className="max-w-7xl mx-auto">
                    {selectedEventId && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold animate-bounce shadow-lg border border-blue-400">
                            SELECT AN AGENT TO DISPATCH
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        {squad.map((card) => {
                            // Check if card is busy
                            const activeMission = events.find(e => e.assignedCardId === card._id && e.status === "in-progress");
                            const isBusy = !!activeMission;

                            return (
                                <div
                                    key={card._id}
                                    className={cn(
                                        "relative transition-all duration-300 group",
                                        isBusy ? "opacity-50 grayscale" : "hover:-translate-y-4 cursor-pointer",
                                        selectedEventId && !isBusy ? "ring-2 ring-blue-500 rounded-lg scale-105" : ""
                                    )}
                                    onClick={() => !isBusy && handleDispatch(card)}
                                >
                                    {/* Card Preview (Simplified or full) */}
                                    <div className="w-[120px] h-[160px] relative rounded-lg overflow-hidden border border-white/20 bg-slate-800">
                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" />

                                        {/* Stats overlay for quick decision */}
                                        <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 flex justify-around text-[10px] font-mono text-white">
                                            <span title="Attack" className="flex items-center"><Sword className="w-3 h-3 text-red-400 mr-0.5" /> {card.attributes.attack}</span>
                                            <span title="Speed" className="flex items-center"><Zap className="w-3 h-3 text-yellow-400 mr-0.5" /> {card.attributes.speed}</span>
                                            <span title="Intel" className="flex items-center"><Brain className="w-3 h-3 text-purple-400 mr-0.5" /> {card.attributes.intelligence}</span>
                                        </div>

                                        {/* Busy Overlay */}
                                        {isBusy && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                                <Clock className="w-6 h-6 animate-spin mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Deployed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}