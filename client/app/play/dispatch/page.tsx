"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/axios.config";
import { IUserProfile } from "@/types/user";
import { ICard } from "@/types/card";
import { TradingCard } from "@/components/TradingCard";
import { EmptyState, GameShell, ScreenHeader } from "@/components/game-shell";
import { CardPicker, SquadSlots, SquadTotals } from "@/components/squad";
import {
  AlertTriangle,
  RotateCcw,
  MapPin,
  Home,
  Radar,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@/components/ui/map";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { cities, CityData } from "@/static_data/cities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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

interface SquadMember extends ICard {
  currentHealth: number;
}


const EVENT_TEMPLATES = [
  {
    title: "Rampaging Beast",
    description:
      "A massive creature is destroying the outer walls. We need brute force!",
    type: "combat",
  },
  {
    title: "Firewall Breach",
    description:
      "Decrypt the enemy communications before they change the codes.",
    type: "intel",
  },
  {
    title: "Supply Run",
    description:
      "Deliver urgent medical supplies to the front lines. Speed is of the essence.",
    type: "stealth",
  },
  {
    title: "Civilian Escort",
    description:
      "Protect the VIPs moving through the warzone. Ensure no harm comes to them.",
    type: "defense",
  },
  {
    title: "Tactical Ambush",
    description: "The enemy is flanking. We need a smart counter-strategy.",
    type: "intel",
  },
  {
    title: "Duel Request",
    description:
      "An enemy commander has issued a challenge. Send your strongest duelest.",
    type: "combat",
  },
  {
    title: "Infiltration",
    description: "Sneak into the base undetected and disable the alarms.",
    type: "stealth",
  },
  {
    title: "Hold the Line",
    description: "They remain fortified until reinforcements arrive!",
    type: "defense",
  },
];

export default function DispatchGamePage() {
  const [gameState, setGameState] = useState<GameState>("SELECTION");
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>([]);

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
      }, 8000);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
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
    setEvents((prev) => {
      const cleanEvents = prev.filter((e) => {
        if (e.status === "completed")
          return Date.now() - (e.startTime || 0) < 5000;
        if (e.status === "failed")
          return Date.now() - (e.startTime || 0) < 60000; // Keep failed missions in feed for 60s
        if (e.status === "active" && e.expiresAt < Date.now()) return false;
        return true;
      });


      if (cleanEvents.length >= 6) return cleanEvents;

      const template =
        EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const id = Math.random().toString(36).substring(7);
      const difficulty = Math.floor(Math.random() * 3) + 1;

      const bounds = selectedCity.bounds;
      const lng =
        bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
      const lat =
        bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);

      const newEvent: DispatchEvent = {
        id,
        title: template.title,
        description: template.description,
        type: template.type as any,
        difficulty,
        coordinates: [lng, lat],
        duration: 10000 * difficulty,
        expiresAt: Date.now() + 30000,
        status: "active",
      };
      return [...cleanEvents, newEvent];
    });
  };

  const handleDispatch = (card: ICard) => {
    if (!selectedEventId) return;

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === selectedEventId && ev.status === "active") {
          return {
            ...ev,
            status: "in-progress",
            assignedCardId: card._id,
            startTime: Date.now(),
          };
        }
        return ev;
      })
    );
    setSelectedEventId(null);
    toast.info(`${card.name} dispatched!`);
  };

  useEffect(() => {
    if (gameState !== "PLAYING" || squad.length === 0) return;
    
    const allDead = squad.every(s => s.currentHealth <= 0);
    if (allDead) {
      setTimeout(() => {
        setGameState("GAME_OVER");
        toast.error("SQUAD WIPEOUT: All units are incapacitated.");
      }, 1500); // Small delay for the last death to register visually
    }
  }, [squad, gameState]);

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    setEvents((prevEvents) => {
      let modified = false;
      const nextEvents = prevEvents.map((ev) => {
        if (ev.status === "in-progress" && ev.startTime) {
          const elapsed = now - ev.startTime;
          if (elapsed >= ev.duration) {
            const card = squad.find((c) => c._id === ev.assignedCardId);
            if (!card) return ev;

            let statValue = 0;
            switch (ev.type) {
              case "combat": statValue = card.attributes.attack; break;
              case "defense": statValue = card.attributes.defense; break;
              case "stealth": statValue = card.attributes.speed; break;
              case "intel": statValue = card.attributes.intelligence; break;
            }

            const requirement = ev.difficulty * 50;
            const success = statValue >= requirement;

            modified = true;
            if (success) {
              setScore((s) => s + ev.difficulty * 100);
              toast.success(`Mission Success: ${card.name} prevailed!`);
              return { ...ev, status: "completed" as any };
            } else {
              toast.error(`Mission Failed: ${card.name} was overwhelmed!`);
              setSquad((prevSquad) =>
                prevSquad.map((s) =>
                  s._id === card._id
                    ? { ...s, currentHealth: Math.max(0, s.currentHealth - 20) }
                    : s
                )
              );
              return { ...ev, status: "failed" as any };
            }

          }
        }
        return ev;
      });
      return modified ? nextEvents : prevEvents;
    });
  }, [now, gameState, squad]);



  const toggleSquadSelection = (card: ICard) => {
    if (squad.find((c) => c._id === card._id)) {
      setSquad(squad.filter((c) => c._id !== card._id));
    } else {
      if (squad.length >= MAX_SQUAD_SIZE) {
        toast.error("Squad full!");
        return;
      }
      setSquad([...squad, { ...card, currentHealth: 100 }]);
    }
  };


  if (!profile)
    return (
      <GameShell>
        <EmptyState title="Establishing uplink…" />
      </GameShell>
    );

  // --- RENDER: SELECTION ---
  if (gameState === "SELECTION") {
    return (
      <GameShell className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-0 flex-1 flex-col px-5 pt-5 md:px-10 md:pt-8">
          <ScreenHeader eyebrow="Dispatch · Setup" title="Assemble strike team" />

          <div className="mt-5 shrink-0">
            <div className="eyebrow mb-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5" strokeWidth={1.5} /> Theater
            </div>
            <div className="scroll-x -mx-5 flex gap-2 px-5 pb-1 md:mx-0 md:px-0">
              {cities.map((city) => {
                const active = selectedCity.id === city.id;
                return (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={cn(
                      "plate [--c:8px] shrink-0 px-4 py-2.5 text-left transition-colors duration-500",
                      active && "plate-gold",
                    )}
                  >
                    <div className={cn("font-display text-lg font-bold uppercase leading-none", active ? "text-gold" : "text-foreground/80")}>
                      {city.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="scroll-area fade-y -mx-5 mt-2 min-h-0 flex-1 px-5 pb-10 pt-5 md:mx-0 md:px-0">
            {profile.ownedCards.length === 0 ? (
              <EmptyState
                title="No operatives"
                body="You need cards to form a strike team."
                action={<Link href="/marketplace" className="btn btn-gold h-11 px-6 text-sm">Visit store</Link>}
              />
            ) : (
              <CardPicker
                owned={profile.ownedCards}
                isPicked={(card) => squad.some((c) => c._id === card._id)}
                onToggle={toggleSquadSelection}
              />
            )}
          </div>
        </section>

        <aside className="flex shrink-0 flex-col gap-4 border-t border-white/[0.06] bg-[#0a0a0f]/80 p-4 lg:min-h-0 lg:gap-6 lg:border-l lg:border-t-0 lg:p-6">
          <div className="font-display text-2xl font-extrabold uppercase italic">
            Strike team <span className="text-gold tabular-nums">{squad.length}</span>
            <span className="text-muted-foreground">/{MAX_SQUAD_SIZE}</span>
          </div>
          <div className="scroll-area flex min-h-0 flex-col gap-6 lg:flex-1">
            <SquadSlots
              cards={squad}
              max={MAX_SQUAD_SIZE}
              onRemove={(id) => setSquad(squad.filter((c) => c._id !== id))}
            />
            <div className="hidden lg:block">
              <SquadTotals cards={squad} />
            </div>
            <div className="plate [--c:10px] hidden p-4 lg:block">
              <div className="eyebrow text-muted-foreground">Theater</div>
              <div className="mt-1 font-display text-2xl font-bold uppercase leading-none">{selectedCity.name}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{selectedCity.description}</p>
            </div>
          </div>
          <button
            disabled={squad.length !== MAX_SQUAD_SIZE}
            onClick={() => setGameState("PLAYING")}
            className="btn btn-gold h-12 w-full shrink-0 text-base"
          >
            <Radar className="size-4" strokeWidth={1.75} />
            {squad.length === MAX_SQUAD_SIZE ? "Commence mission" : `Pick ${MAX_SQUAD_SIZE - squad.length} more`}
          </button>
        </aside>
      </GameShell>
    );
  }

  // --- RENDER: PLAYING ---
  return (
    <div className="h-dvh w-full bg-ink relative overflow-hidden flex flex-col">
      {/* FULL SCREEN MAP BACKDROP */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <Map
          center={selectedCity.center}
          zoom={12}
          minZoom={10}
          maxZoom={15}
          styles={{
            dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            light:
              "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
          }}
        >
          <MapControls />

          {events.map((ev) => {
            if (ev.status === "completed" || ev.status === "failed")
              return null;

            const isSelected = selectedEventId === ev.id;
            const timeLeft = Math.max(0, ev.expiresAt - now);
            const progress =
              ev.status === "in-progress" && ev.startTime
                ? ((now - ev.startTime) / ev.duration) * 100
                : 0;

            return (
              <MapMarker
                key={ev.id}
                longitude={ev.coordinates[0]}
                latitude={ev.coordinates[1]}
                onClick={() =>
                  ev.status === "active" && setSelectedEventId(ev.id)
                }
              >
                <MarkerContent>
                  <div
                    className={cn(
                      "flex flex-col items-center transition-all duration-300 group",
                      isSelected ? "scale-110" : "hover:scale-105"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all duration-500 backdrop-blur-md relative",
                        ev.status === "in-progress"
                          ? "border-blue-500 bg-blue-500/20 ring-4 ring-blue-500/10"
                          : ev.status === "active"
                          ? "border-red-500 bg-red-500/20 animate-pulse ring-4 ring-red-500/10 shadow-red-500/20"
                          : "border-gray-500 bg-gray-500/20"
                      )}
                    >
                      {ev.status === "in-progress" ? (
                        <RotateCcw className="w-6 h-6 text-blue-500 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {/* Marker Tooltip / Info Popup */}
                    <div
                      className={cn(
                        "mt-3 bg-[#0c0c11]/95 text-white p-4 border-t-2 border-gold/60 text-center w-56 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in-95 fade-in duration-300 origin-top",
                        isSelected
                          ? "ring-2 ring-blue-500 scale-100 opacity-100"
                          : "scale-90 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                      )}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border shadow-sm",
                            ev.type === "combat"
                              ? "text-red-400 border-red-500/30 bg-red-500/10"
                              : ev.type === "intel"
                              ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                              : ev.type === "stealth"
                              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                          )}
                        >
                          {ev.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-black">
                          XDR-0{ev.difficulty}
                        </span>
                      </div>

                      <div className="text-sm font-black leading-tight mb-2 uppercase tracking-tight text-white/90">
                        {ev.title}
                      </div>

                      {ev.status === "active" && (
                        <>
                          <div className="text-[10px] text-slate-400 italic mb-4 px-1 leading-relaxed line-clamp-2">
                            "{ev.description}"
                          </div>
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="bg-red-500 h-full transition-all duration-1000"
                                style={{
                                  width: `${(timeLeft / 30000) * 100}%`,
                                }}
                              />
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
                          <Progress
                            value={progress}
                            className="h-2 bg-white/5 rounded-full"
                          />
                          <div className="text-[8px] text-slate-500 tracking-widest font-bold">
                            OPERATIVE ON SITE
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            );
          })}
        </Map>

        {/* Visual Overlays for Map */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px] pointer-events-none" />
      </div>

      {/* HUD: TOP COMMAND BAR */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <div className="plate [--c:12px] [--plate-bg:rgb(10_10_15/0.9)] px-5 py-3 flex items-center gap-5">
            <Link href="/" aria-label="Lobby" className="chamfer [--c:6px] grid size-10 place-items-center bg-[image:var(--metal-gold)]">
              <span className="chamfer [--c:5px] grid size-[38px] place-items-center bg-ink font-display text-lg font-extrabold italic text-gold">O</span>
            </Link>
            <div>
              <h2 className="eyebrow text-muted-foreground">
                {selectedCity.name} · Score
              </h2>
              <div className="font-display text-4xl font-extrabold tabular-nums leading-none">
                {score.toLocaleString().padStart(6, "0")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            className="btn btn-danger h-11 px-5 text-sm"
            onClick={() => {
              setGameState("SELECTION");
              setEvents([]);
              setScore(0);
            }}
          >
            Abort
          </button>
        </div>
      </div>

      {/* HUD: LEFT MISSION FEED */}
      <div className="absolute left-6 top-32 bottom-48 w-64 z-20 pointer-events-none hidden lg:flex flex-col gap-4 overflow-hidden mask-fade-bottom">
        <h3 className="eyebrow text-red-400/90 px-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Mission Failures
        </h3>
        <div className="space-y-3">
          {events
            .filter((e) => e.status === "failed")
            .reverse() // Most recent failures first
            .slice(0, 8)
            .map((ev) => {
              const card = squad.find((s) => s._id === ev.assignedCardId);
              return (
                <div
                  key={ev.id}
                  className="border-l-2 border-red-500/70 bg-[#140a0c]/90 p-3 animate-in slide-in-from-left duration-500"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-red-400 opacity-60">
                      ERR_{ev.id.toUpperCase()}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                  <div className="text-[11px] font-black text-white uppercase truncate">
                    {ev.title}
                  </div>
                  <div className="mt-1 text-[8px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="opacity-50">Failed:</span>
                    <span>{card?.name || "Unknown Unit"}</span>
                  </div>
                </div>
              );
            })}
          {events.filter((e) => e.status === "failed").length === 0 && (
            <div className="px-2 py-4 border border-dashed border-white/10 bg-ink/70">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
                All Units Operational
              </p>
            </div>
          )}
        </div>
      </div>


      {/* HUD: BOTTOM SQUAD DECK & DRAWER */}
      <SquadDrawer
        squad={squad}
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        isSquadExpanded={isSquadExpanded}
        setIsSquadExpanded={setIsSquadExpanded}
        onDispatch={handleDispatch}
      />

      {/* END GAME MODAL */}
      {gameState === "GAME_OVER" && (
        <EndGamePopup 
          score={score} 
          onRestart={() => {
            setGameState("SELECTION");
            setSquad([]);
            setEvents([]);
            setScore(0);
          }}
        />
      )}


      {/* RADAR SWEEP EFFECT */}
      {/* <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.05)_10deg,transparent_90deg)] animate-[spin_8s_linear_infinite]" />
            </div> */}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function EndGamePopup({ score, onRestart }: { score: number, onRestart: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#050507]/85 p-6 backdrop-blur-md animate-in fade-in duration-500">
      <div className="plate [--c:20px] [--plate-edge:linear-gradient(160deg,rgb(240_90_79/0.7),rgb(255_255_255/0.04)_50%,rgb(240_90_79/0.3))] w-full max-w-md p-8 text-center">
        <div className="eyebrow text-red-400">All units K.I.A.</div>
        <h2 className="mt-2 font-display text-5xl font-extrabold uppercase italic leading-[0.9]">
          Mission<br />terminated
        </h2>

        <div className="my-8 border-y border-white/[0.06] py-6">
          <span className="eyebrow text-muted-foreground">Final score</span>
          <div className="mt-1 font-display text-6xl font-extrabold tabular-nums text-metal">
            {score.toLocaleString().padStart(6, "0")}
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={onRestart} className="btn btn-gold h-12 w-full text-base">
            <RotateCcw className="size-4" strokeWidth={1.75} />
            Redeploy
          </button>
          <Link href="/" className="btn btn-ghost h-12 w-full text-base">
            <Home className="size-4" strokeWidth={1.5} />
            Back to lobby
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SquadDrawerProps {

  squad: SquadMember[];
  events: DispatchEvent[];
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  isSquadExpanded: boolean;
  setIsSquadExpanded: (expanded: boolean) => void;
  onDispatch: (card: ICard) => void;
}


function SquadDrawer({
  squad,
  events,
  selectedEventId,
  setSelectedEventId,
  isSquadExpanded,
  setIsSquadExpanded,
  onDispatch,
}: SquadDrawerProps) {
  return (
    <>
      {/* Trigger Button */}
      <div className="absolute bottom-10 left-0 right-0 z-40 flex justify-center pointer-events-none">
        {!selectedEventId && (
          <button
            onClick={() => setIsSquadExpanded(true)}
            className="plate [--c:10px] [--plate-bg:rgb(10_10_15/0.92)] pointer-events-auto flex items-center gap-3 py-2 pl-5 pr-2 group"
          >
            <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
              Strike team
            </span>
            <div className="flex -space-x-2 ml-2">
              {squad.map((card) => (
                <Avatar key={card._id} className="rounded-none chamfer [--c:4px] ring-0">
                    <AvatarImage src={card.imageUrl} className="object-cover size-10"/>
                    <AvatarFallback>
                        {card.name[0]}
                    </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </button>
        )}
      </div>

      <Drawer
        open={selectedEventId !== null || isSquadExpanded}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventId(null);
            setIsSquadExpanded(false);
          }
        }}
      >
        <DrawerContent className="bg-[#08080c]/95 border-t border-gold/20 backdrop-blur-2xl">
          <div className="mx-auto w-full px-4 pb-6">
            <DrawerHeader className="pb-2 text-center">
              <DrawerTitle className="font-display text-2xl font-extrabold italic uppercase text-center flex items-center justify-center gap-3">
                {selectedEventId ? (
                  <>
                    <AlertTriangle className="size-5 text-red-500 animate-pulse" strokeWidth={1.5} />
                    {events.find((e) => e.id === selectedEventId)?.title}
                  </>
                ) : (
                  "Strike Team Status"
                )}
              </DrawerTitle>
              <DrawerDescription className="eyebrow text-center">
                {selectedEventId
                  ? "Select an operative to dispatch for this mission"
                  : "Monitor your squad and mission progress"}
              </DrawerDescription>
            </DrawerHeader>

            <div className="scroll-x flex gap-3 pt-2 pb-1 md:justify-center">
              {squad.map((card) => {
                const activeMission = events.find(
                  (e) =>
                    e.assignedCardId === card._id && e.status === "in-progress"
                );
                const isBusy = !!activeMission;
                const isDead = card.currentHealth <= 0;
                
                return (
                  <div
                    key={card._id}
                    className={cn(
                      "relative shrink-0 [zoom:0.5] md:[zoom:0.6] [@media(max-height:700px)]:[zoom:0.42] transition-[opacity,filter] duration-500 group",
                      (isBusy || isDead)
                        ? "opacity-40 grayscale"
                        : "cursor-pointer"
                    )}
                    onClick={() => {
                      if (!isBusy && !isDead && selectedEventId) {
                        onDispatch(card);
                      }
                    }}
                  >
                    <div className="transition-transform duration-500 ease-snap group-hover:-translate-y-2">
                      <TradingCard {...card} health={card.currentHealth} />
                    </div>

                    {isBusy && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/50 z-20">
                        <RotateCcw className="w-10 h-10 animate-spin text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-2">
                          Deployed
                        </span>
                      </div>
                    )}

                    {isDead && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/60 z-20">
                         <div className="p-3 bg-red-600 rounded-full shadow-2xl shadow-red-600/50 mb-3 animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-white" />
                         </div>
                        <span className="text-[14px] font-black uppercase tracking-[0.3em] text-red-400 drop-shadow-lg">
                          K.I.A
                        </span>
                        <span className="text-[8px] font-bold text-red-500/80 mt-1 uppercase">Unit Incapacitated</span>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>

          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
