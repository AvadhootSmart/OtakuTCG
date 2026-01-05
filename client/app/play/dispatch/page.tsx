"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/axios.config";
import { IUserProfile } from "@/types/user";
import { ICard } from "@/types/card";
import { TradingCard } from "@/components/TradingCard";
import { Button } from "@/components/ui/button";
import { Loader2, Sword, Zap, Brain, Clock, AlertTriangle, RotateCcw, CheckCircle, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";

import { cities, CityData } from "@/static_data/cities";

// --- Game Definitions ---

type GameState = "SELECTION" | "PLAYING" | "GAME_OVER";

interface DispatchEvent {
    id: string;
    title: string;
    description: string;
    type: "combat" | "intel" | "stealth" | "defense";
    difficulty: number;
    coordinates: [number, number];
    duration: number;
    expiresAt: number;
    status: "active" | "in-progress" | "completed" | "expired" | "failed";
    assignedCardId?: string;
    startTime?: number;
}

const EVENT_TEMPLATES = [
    { title: "Rampaging Beast", description: "A massive creature is destroying the outer walls. We need brute force!", type: "combat" },
    { title: "Firewall Breach", description: "Decrypt the enemy communications before they change the codes.", type: "intel" },
    { title: "Supply Run", description: "Deliver urgent medical supplies to the front lines. Speed is of the essence.", type: "stealth" },
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
    const [selectedCity, setSelectedCity] = useState<CityData>(cities[0]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());
    const [score, setScore] = useState(0);
    const [isSquadExpanded, setIsSquadExpanded] = useState(true);

    const MAX_SQUAD_SIZE = 5;
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchProfile();
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (gameState === "PLAYING") {
            gameLoopRef.current = setInterval(() => {
                spawnEventLogic();
            }, 5000);
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
    }, [gameState]);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/user/profile");
            setProfile(res.data);
        } catch (error) {
            toast.error("Failed to load profile");
        }
    };

    const spawnEventLogic = () => {
        setEvents(prev => {
            const cleanEvents = prev.filter(e => {
                if (e.status === 'completed' || e.status === 'failed') return Date.now() - (e.startTime || 0) < 5000;
                if (e.status === 'active' && e.expiresAt < Date.now()) return false;
                return true;
            });

            if (cleanEvents.length >= 6) return cleanEvents;

            const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
            const id = Math.random().toString(36).substring(7);
            const difficulty = Math.floor(Math.random() * 3) + 1;

            const bounds = selectedCity.bounds;
            const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
            const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);

            const newEvent: DispatchEvent = {
                id,
                title: template.title,
                description: template.description,
                type: template.type as any,
                difficulty,
                coordinates: [lng, lat],
                duration: 10000 * difficulty,
                expiresAt: Date.now() + 30000,
                status: "active"
            };
            return [...cleanEvents, newEvent];
        });
    };

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

    useEffect(() => {
        if (gameState !== "PLAYING") return;

        setEvents(prev => prev.map(ev => {
            if (ev.status === "in-progress" && ev.startTime) {
                const elapsed = now - ev.startTime;
                if (elapsed >= ev.duration) {
                    const card = squad.find(c => c._id === ev.assignedCardId);
                    if (!card) return { ...ev, status: "failed" };

                    let statValue = 0;
                    switch (ev.type) {
                        case 'combat': statValue = card.attributes.attack; break;
                        case 'defense': statValue = card.attributes.defense; break;
                        case 'stealth': statValue = card.attributes.speed; break;
                        case 'intel': statValue = card.attributes.intelligence; break;
                    }

                    const requirement = ev.difficulty * 50;
                    const success = statValue >= requirement;

                    if (success) {
                        setScore(s => s + (ev.difficulty * 100));
                        if (Math.random() > 0.8) toast.success(`Mission Success! +${ev.difficulty * 100} PTS`);
                        return { ...ev, status: "completed" };
                    } else {
                        if (Math.random() > 0.8) toast.error("Mission Failed! Unit was overwhelmed.");
                        return { ...ev, status: "failed" };
                    }
                }
            }
            return ev;
        }));
    }, [now, gameState, squad]);

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

    if (!profile) return <div className="h-screen w-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;

    // --- RENDER: SELECTION ---
    if (gameState === "SELECTION") {
        return (
            <div className="min-h-screen bg-slate-950 p-6 pb-20 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                        <div>
                            <h1 className="text-4xl font-black rock-salt tracking-tighter text-white">Dispatch Ops</h1>
                            <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Select your strike team</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Team Composition</span>
                                <div className="text-3xl font-black text-blue-500 font-mono">
                                    {squad.length}<span className="text-slate-700 mx-1">/</span>{MAX_SQUAD_SIZE}
                                </div>
                            </div>
                            <Button
                                size="lg"
                                disabled={squad.length !== MAX_SQUAD_SIZE}
                                onClick={() => setGameState("PLAYING")}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-8 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all duration-300 active:scale-95 border-b-4 border-blue-800 disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                COMMENCE MISSION
                            </Button>
                        </div>
                    </header>

                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Select Operational Theater</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {cities.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => setSelectedCity(city)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                                        selectedCity.id === city.id
                                            ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                            : "bg-slate-900/50 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="font-black text-white uppercase tracking-tighter text-lg">{city.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{city.description}</div>
                                    {selectedCity.id === city.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-12 mb-6">
                        <Sword className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Assemble Strike Team</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                        {profile.ownedCards.map((ownership) => {
                            const card = ownership.cardId;
                            if (!card) return null;
                            const isSelected = squad.some(c => c._id === card._id);

                            return (
                                <div key={card._id} className="relative cursor-pointer group" onClick={() => toggleSquadSelection(card)}>
                                    <div className={cn(
                                        "transition-all duration-500 transform",
                                        isSelected ? "scale-[1.05]" : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                                    )}>
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
        <div className="h-screen w-screen bg-slate-950 relative overflow-hidden flex flex-col font-sans">

            {/* FULL SCREEN MAP BACKDROP */}
            <div className="absolute inset-0 z-0 bg-slate-900">
                <Map
                    center={selectedCity.center}
                    zoom={12}
                    minZoom={10}
                    maxZoom={15}
                    styles={{
                        dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
                        light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                    }}
                >
                    <MapControls />

                    {events.map((ev) => {
                        if (ev.status === "completed" || ev.status === "failed") return null;

                        const isSelected = selectedEventId === ev.id;
                        const timeLeft = Math.max(0, ev.expiresAt - now);
                        const progress = ev.status === "in-progress" && ev.startTime
                            ? ((now - ev.startTime) / ev.duration) * 100
                            : 0;

                        return (
                            <MapMarker
                                key={ev.id}
                                longitude={ev.coordinates[0]}
                                latitude={ev.coordinates[1]}
                                onClick={() => ev.status === "active" && setSelectedEventId(ev.id)}
                            >
                                <MarkerContent>
                                    <div className={cn(
                                        "flex flex-col items-center transition-all duration-300 group",
                                        isSelected ? "scale-110" : "hover:scale-105"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all duration-500 backdrop-blur-md relative",
                                            ev.status === "in-progress" ? "border-blue-500 bg-blue-500/20 ring-4 ring-blue-500/10" :
                                                ev.status === "active" ? "border-red-500 bg-red-500/20 animate-pulse ring-4 ring-red-500/10 shadow-red-500/20" : "border-gray-500 bg-gray-500/20"
                                        )}>
                                            {ev.status === "in-progress" ?
                                                <RotateCcw className="w-6 h-6 text-blue-500 animate-spin" /> :
                                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                            }

                                            {/* Pulse ring for active events */}
                                            {/* {ev.status === "active" && (
                                                <div className="absolute inset-0 rounded-full border border-red-500 animate-[ping_2s_infinite] opacity-50" />
                                            )} */}
                                        </div>

                                        {/* Marker Tooltip / Info Popup */}
                                        <div className={cn(
                                            "mt-3 bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl border border-white/10 text-center w-56 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in-95 fade-in duration-300 origin-top",
                                            isSelected ? "ring-2 ring-blue-500 scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                                        )}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border shadow-sm",
                                                    ev.type === 'combat' ? "text-red-400 border-red-500/30 bg-red-500/10" :
                                                        ev.type === 'intel' ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
                                                            ev.type === 'stealth' ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                                                                "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                                )}>
                                                    {ev.type}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-500 font-black">XDR-0{ev.difficulty}</span>
                                            </div>

                                            <div className="text-sm font-black leading-tight mb-2 uppercase tracking-tight text-white/90">{ev.title}</div>

                                            {ev.status === "active" && (
                                                <>
                                                    <div className="text-[10px] text-slate-400 italic mb-4 px-1 leading-relaxed line-clamp-2">"{ev.description}"</div>
                                                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                                                            <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(timeLeft / 30000) * 100}%` }} />
                                                        </div>
                                                        <div className="flex justify-between text-[8px] font-bold text-red-500/80 uppercase tracking-widest">
                                                            <span>Signal Loss Near</span>
                                                            <span>{Math.ceil(timeLeft / 1000)}s</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="mt-3 text-[9px] font-black text-blue-500 animate-pulse border border-blue-500/30 bg-blue-500/5 py-1 rounded-md uppercase tracking-widest">
                                                            Ready for Dispatch
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {ev.status === "in-progress" && (
                                                <div className="w-full space-y-3 pt-2 border-t border-white/5">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-blue-400">
                                                        <span>Syncing...</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2 bg-white/5 rounded-full" />
                                                    <div className="text-[8px] text-slate-500 tracking-widest font-bold">OPERATIVE ON SITE</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </MarkerContent>
                            </MapMarker>
                        )
                    })}
                </Map>

                {/* Visual Overlays for Map */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-950/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px] pointer-events-none" />

                {/* HUD SCANLINE TEXTURE */}
                {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-10" /> */}
            </div>

            {/* HUD: TOP COMMAND BAR */}
            <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-white shadow-2xl flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                            <Sword className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Operational Score</h2>
                            <div className="text-4xl font-mono font-black text-white tabular-nums leading-none">
                                {score.toLocaleString().padStart(6, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <Button
                        variant="ghost"
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-black px-6 h-14 rounded-xl transition-all duration-300 shadow-2xl tracking-widest text-[11px]"
                        onClick={() => {
                            setGameState("SELECTION");
                            setEvents([]);
                            setScore(0);
                        }}
                    >
                        ABORT_OP
                    </Button>
                </div>
            </div>

            {/* HUD: LEFT MISSION FEED */}
            <div className="absolute left-6 top-32 bottom-48 w-64 z-20 pointer-events-none hidden lg:flex flex-col gap-4 overflow-hidden mask-fade-bottom">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Active Signal Feed</h3>
                <div className="space-y-3">
                    {events.filter(e => e.status === 'active' || e.status === 'in-progress').slice(0, 5).map(ev => (
                        <div key={ev.id} className={cn(
                            "p-3 rounded-xl border backdrop-blur-md transition-all",
                            ev.id === selectedEventId ? "bg-blue-600/20 border-blue-500 shadow-lg" : "bg-slate-900/60 border-white/5"
                        )}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-mono text-slate-400">SIGN_{ev.id.toUpperCase()}</span>
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full ring-2",
                                    ev.status === 'in-progress' ? "bg-blue-500 ring-blue-500/20" : "bg-red-500 ring-red-500/20 animate-pulse"
                                )} />
                            </div>
                            <div className="text-[11px] font-black text-white uppercase truncate">{ev.title}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* HUD: BOTTOM SQUAD DECK */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-out",
                isSquadExpanded ? "translate-y-0" : "translate-y-[calc(100%-48px)]"
            )}>
                {/* Handle & Prompt */}
                <div className="max-w-7xl mx-auto mb-2 px-6 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSquadExpanded(!isSquadExpanded)}
                            className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-t-2xl pointer-events-auto hover:bg-slate-800 transition-colors shadow-2xl"
                        >
                            {isSquadExpanded ? <ChevronDown className="w-5 h-5 text-blue-500" /> : <ChevronUp className="w-5 h-5 text-blue-500" />}
                        </button>
                        {selectedEventId && (
                            <div className="bg-blue-600 text-white px-8 py-3 rounded-t-2xl font-black text-xs tracking-[0.2em] shadow-2xl border-x border-t border-blue-400 animate-in slide-in-from-bottom duration-500">
                                DEPLOY OPERATIVE TO TARGET
                            </div>
                        )}
                    </div>
                </div>

                {/* Deck Container */}
                <div className="bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 p-6 pt-8 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] pointer-events-auto">
                    <div className="max-w-7xl mx-auto flex justify-center gap-8 items-end h-64">
                        {squad.map((card) => {
                            const activeMission = events.find(e => e.assignedCardId === card._id && e.status === "in-progress");
                            const isBusy = !!activeMission;

                            return (
                                <div
                                    key={card._id}
                                    className={cn(
                                        "relative transition-all duration-500 group",
                                        isBusy ? "opacity-30 grayscale pointer-events-none translate-y-4" : "hover:-translate-y-12 cursor-pointer",
                                        selectedEventId && !isBusy ? "ring-4 ring-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] rounded-2xl scale-110 -translate-y-8" : "hover:scale-110"
                                    )}
                                    onClick={() => !isBusy && handleDispatch(card)}
                                >
                                    <div className="w-[140px] h-[190px] relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl outline outline-offset-4 outline-transparent group-hover:outline-blue-500/20 transition-all">
                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover object-top" sizes="140px" />

                                        {/* Stats overlay */}
                                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md p-2 flex justify-around text-[10px] font-black text-white/90 border-t border-white/5">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <Sword className="w-3 h-3 text-red-500" />
                                                <span>{card.attributes.attack}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <Zap className="w-3 h-3 text-blue-400" />
                                                <span>{card.attributes.speed}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <Brain className="w-3 h-3 text-purple-400" />
                                                <span>{card.attributes.intelligence}</span>
                                            </div>
                                        </div>

                                        {/* Busy Overlay */}
                                        {isBusy && (
                                            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white backdrop-blur-sm shadow-inner">
                                                <RotateCcw className="w-8 h-8 animate-spin mb-2 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Deployed</span>
                                            </div>
                                        )}

                                        {/* Selection Glow */}
                                        {selectedEventId && !isBusy && (
                                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
                                        )}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="text-[10px] font-black uppercase tracking-widest truncate text-white/60 group-hover:text-blue-400 transition-colors">{card.name}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* RADAR SWEEP EFFECT */}
            {/* <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.05)_10deg,transparent_90deg)] animate-[spin_8s_linear_infinite]" />
            </div> */}

        </div>
    );
}