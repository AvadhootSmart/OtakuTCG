"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BookOpen, Layers, Store } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { AuthDialog } from "@/components/auth-dialog";
import { GameModeDialog } from "@/components/game-mode-dialog";
import { GameShell } from "@/components/game-shell";
import { TradingCard } from "@/components/TradingCard";
import { getCards } from "@/api/cards";
import { ICard } from "@/types/card";

const EASE = [0.32, 0.72, 0, 1] as const;
const FAN = [
  { rotate: -11, x: -170, y: 26 },
  { rotate: 11, x: 170, y: 26 },
  { rotate: 0, x: 0, y: -8 },
];

function Rise({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Tile({ icon: Icon, label, meta }: { icon: typeof Store; label: string; meta: string }) {
  return (
    <div className="plate [--c:10px] group flex h-full flex-col justify-between gap-5 p-4 transition-transform duration-500 ease-snap hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <Icon className="size-5 text-muted-foreground transition-colors duration-500 group-hover:text-gold" strokeWidth={1.5} />
        <ArrowUpRight className="size-4 text-muted-foreground/60 transition-transform duration-500 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <div className="font-display text-xl font-bold uppercase leading-none tracking-wide">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const { profile } = useUserStore();
  const [hand, setHand] = useState<ICard[]>([]);

  useEffect(() => {
    getCards()
      .then((cards) => setHand([...cards].sort((a, b) => b.overall - a.overall).slice(0, 3)))
      .catch(() => setHand([]));
  }, []);

  const owned = profile?.ownedCards?.length ?? 0;
  const packs = profile?.inventoryPacks?.reduce((n, p) => n + p.count, 0) ?? 0;

  return (
    <GameShell className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left: title + actions */}
      <section className="relative z-10 flex min-h-0 flex-col justify-center gap-[clamp(1rem,3.5vh,2.5rem)] px-5 py-6 md:px-12 lg:pl-16 xl:pl-24">
        <Rise>
          <span className="inline-flex items-center gap-2 border border-gold/25 bg-gold/[0.06] px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            <span className="size-1.5 rotate-45 bg-gold" />
            Season 01 · Awakening
          </span>
        </Rise>

        <Rise delay={0.08}>
          <h1 className="font-display font-extrabold uppercase italic leading-[0.82] tracking-[-0.02em] text-[clamp(3.5rem,min(15vh,12vw),10.5rem)]">
            Otaku
            <br />
            <span className="text-metal pr-2">TCG</span>
          </h1>
          <p className="mt-[clamp(0.75rem,2vh,1.5rem)] max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Pull legends from sealed packs, draft squads of five, and send them into missions across the city.
          </p>
        </Rise>

        <Rise delay={0.16} className="flex max-w-xl flex-col gap-3">
          {session ? (
            <GameModeDialog>
              <button type="button" className="btn btn-gold group h-16 w-full justify-between pl-7 pr-2 text-2xl">
                Play
                <span className="chamfer [--c:6px] grid size-12 place-items-center bg-[#1a1204]/15 transition-transform duration-500 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-6" strokeWidth={1.75} />
                </span>
              </button>
            </GameModeDialog>
          ) : (
            <AuthDialog>
              <button type="button" className="btn btn-gold group h-16 w-full justify-between pl-7 pr-2 text-2xl">
                Enter the arena
                <span className="chamfer [--c:6px] grid size-12 place-items-center bg-[#1a1204]/15 transition-transform duration-500 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-6" strokeWidth={1.75} />
                </span>
              </button>
            </AuthDialog>
          )}

          <div className={`grid gap-3 ${session ? "grid-cols-3" : "grid-cols-2"} [@media(max-height:620px)]:hidden`}>
            {session && (
              <Link href="/profile">
                <Tile icon={Layers} label="Collection" meta={`${owned} cards · ${packs} packs`} />
              </Link>
            )}
            <Link href="/marketplace">
              <Tile icon={Store} label="Store" meta="Booster packs" />
            </Link>
            <Link href="/showcase">
              <Tile icon={BookOpen} label="Codex" meta="Every card" />
            </Link>
          </div>
        </Rise>

        {session && profile && (
          <Rise delay={0.24} className="hidden max-w-xl grid-cols-3 border-t border-white/[0.06] pt-5 sm:grid [@media(max-height:720px)]:hidden">
            {[
              { label: "Level", value: profile.level ?? 1 },
              { label: "XP", value: (profile.xp ?? 0).toLocaleString() },
              { label: "Wins", value: profile.stats?.matchesWon ?? 0 },
            ].map((s) => (
              <div key={s.label}>
                <div className="eyebrow text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-3xl font-bold tabular-nums">{s.value}</div>
              </div>
            ))}
          </Rise>
        )}
      </section>

      {/* Right: summoning circle + fanned hand */}
      <section className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden opacity-25 lg:pointer-events-auto lg:relative lg:opacity-100">
        <svg
          aria-hidden
          viewBox="0 0 600 600"
          className="absolute size-[min(88vh,52vw)] min-w-[520px] animate-[spin_120s_linear_infinite] text-gold"
        >
          <circle cx="300" cy="300" r="290" fill="none" stroke="currentColor" strokeOpacity="0.14" />
          <circle cx="300" cy="300" r="262" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 10" />
          <circle cx="300" cy="300" r="200" fill="none" stroke="currentColor" strokeOpacity="0.08" />
          <polygon points="300,40 525,430 75,430" fill="none" stroke="currentColor" strokeOpacity="0.08" />
          <polygon points="300,560 75,170 525,170" fill="none" stroke="currentColor" strokeOpacity="0.08" />
        </svg>
        <div className="absolute size-[40vh] rounded-full bg-violet-600/20 blur-[90px]" />

        <div className="relative hidden h-[416px] w-[288px] lg:block [@media(max-height:820px)]:[zoom:0.8] [@media(max-height:660px)]:[zoom:0.62]">
          {hand.map((card, i) => {
            const f = hand.length === 3 ? FAN[i] : { rotate: 0, x: (i - (hand.length - 1) / 2) * 200, y: 0 };
            return (
              <motion.div
                key={card._id}
                className="absolute inset-0"
                style={{ zIndex: i === 2 ? 3 : 1 }}
                initial={{ opacity: 0, y: 140, rotate: 0, x: 0 }}
                animate={{ opacity: 1, y: f.y, rotate: f.rotate, x: f.x }}
                whileHover={{ y: f.y - 28, scale: 1.04, zIndex: 5, transition: { duration: 0.5, ease: EASE } }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}
              >
                <TradingCard {...card} />
              </motion.div>
            );
          })}
        </div>
      </section>
    </GameShell>
  );
}
