"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Coins, LogOut, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { TradingCard } from "@/components/TradingCard";
import { CardPack } from "@/components/CardPack";
import { PackOpeningOverlay } from "@/components/PackOpeningOverlay";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";
import { EmptyState, GameShell, RARITY_ORDER } from "@/components/game-shell";
import { IPack } from "@/types/pack";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { profile, error, fetchProfile } = useUserStore();
  const [tab, setTab] = useState<"cards" | "packs">("cards");
  const [selectedPack, setSelectedPack] = useState<IPack | null>(null);

  useEffect(() => {
    if (!sessionPending && !session) router.replace("/");
  }, [session, sessionPending, router]);

  const handleCloseOverlay = () => {
    setSelectedPack(null);
    fetchProfile();
  };

  if (!profile || !session) {
    return (
      <GameShell>
        <EmptyState title={error ? "Vault unavailable" : "Opening vault…"} body={error ?? undefined} />
      </GameShell>
    );
  }

  const userCards = profile.ownedCards
    .filter((oc) => oc.cardId !== null)
    .map((oc) => ({ ...oc.cardId, count: oc.count }))
    .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || b.overall - a.overall);
  const userPacks = profile.inventoryPacks
    .filter((ip) => ip.packId !== null)
    .map((ip) => ({ ...ip.packId, count: ip.count }));
  const packTotal = userPacks.reduce((n, p) => n + p.count, 0);

  const stats = [
    { label: "Level", value: profile.level ?? 1 },
    { label: "XP", value: (profile.xp ?? 0).toLocaleString() },
    { label: "Wins", value: profile.stats?.matchesWon ?? 0 },
    { label: "Played", value: profile.stats?.matchesPlayed ?? 0 },
  ];

  return (
    <GameShell className="flex flex-col lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Player panel */}
      <aside className="relative shrink-0 border-b border-white/[0.06] bg-[#0a0a0f]/70 lg:min-h-0 lg:border-b-0 lg:border-r">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_60%_at_30%_0%,rgba(245,196,81,0.12),transparent_70%)]" />
        <div className="scroll-area relative flex h-full flex-row items-center gap-4 p-4 lg:flex-col lg:items-stretch lg:gap-8 lg:p-8">
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:flex-none lg:flex-col lg:items-start lg:gap-5">
            <div className="relative shrink-0">
              <div className="chamfer [--c:10px] size-14 bg-[image:var(--metal-gold)] p-[2px] lg:size-24 lg:[--c:16px]">
                <div className="chamfer [--c:9px] grid size-full place-items-center bg-[radial-gradient(circle_at_35%_30%,#26262c,#0a0a0c)] font-display text-2xl font-extrabold uppercase italic text-gold lg:text-5xl lg:[--c:15px]">
                  {session.user.name?.[0]}
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ink px-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/40 lg:text-xs">
                Lv {profile.level ?? 1}
              </span>
            </div>
            <div className="min-w-0">
              <div className="eyebrow hidden text-muted-foreground lg:block">Commander</div>
              <h1 className="truncate font-display text-2xl font-extrabold uppercase italic leading-none lg:mt-1 lg:text-4xl">
                {session.user.name}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Since {new Date(session.user.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>

          <BuyCoinsDialog>
            <button type="button" className="plate plate-gold [--c:10px] group flex shrink-0 items-center gap-3 p-2 pl-3 text-left lg:p-4">
              <Coins className="size-5 text-gold" strokeWidth={1.5} />
              <span className="flex-1">
                <span className="eyebrow hidden lg:block">Balance</span>
                <span className="font-display text-xl font-extrabold tabular-nums lg:text-3xl">{profile.balance.toLocaleString()}</span>
              </span>
              <span className="chamfer [--c:5px] hidden size-8 place-items-center bg-gold/15 text-gold transition-transform duration-500 ease-snap group-hover:scale-105 lg:grid">
                <Plus className="size-4" strokeWidth={2} />
              </span>
            </button>
          </BuyCoinsDialog>

          <div className="hidden grid-cols-2 gap-2 lg:grid">
            {stats.map((s) => (
              <div key={s.label} className="plate [--c:8px] p-4">
                <div className="eyebrow text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-3xl font-bold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => authClient.signOut()}
            className="mt-auto hidden items-center gap-2 self-start font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:text-destructive lg:flex"
          >
            <LogOut className="size-4" strokeWidth={1.5} /> Sign out
          </button>
        </div>
      </aside>

      {/* Collection */}
      <section className="flex min-h-0 flex-1 flex-col px-5 pt-5 md:px-10 md:pt-8">
        <div className="flex shrink-0 items-end justify-between gap-4 border-b border-white/[0.06]">
          <div className="flex">
            {([
              { id: "cards", label: "Cards", count: userCards.length },
              { id: "packs", label: "Packs", count: packTotal },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex items-baseline gap-2 px-3 pb-3 font-display text-2xl font-extrabold uppercase italic transition-colors duration-500 md:text-3xl",
                  tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span className={cn("text-sm not-italic tabular-nums", t.id === "packs" && t.count > 0 ? "text-gold" : "opacity-50")}>
                  {t.count}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-[2px] bg-gold transition-transform duration-500 ease-snap",
                    tab === t.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
          <Link href="/marketplace" className="eyebrow pb-3.5 text-muted-foreground transition-colors hover:text-gold">
            Store →
          </Link>
        </div>

        <div className="scroll-area fade-y -mx-5 min-h-0 flex-1 px-5 pb-10 pt-6 md:mx-0 md:px-0">
          {tab === "cards" ? (
            userCards.length === 0 ? (
              <EmptyState
                title="No cards yet"
                body="Open a booster pack to pull your first legends."
                action={<Link href="/marketplace" className="btn btn-gold h-11 px-6 text-sm">Visit store</Link>}
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] justify-items-center gap-x-3 gap-y-6 md:grid-cols-[repeat(auto-fill,minmax(202px,1fr))]">
                {userCards.map((card, i) => (
                  <motion.div
                    key={card._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: Math.min(i, 12) * 0.04, ease: EASE }}
                    className="relative [zoom:0.52] md:[zoom:0.7]"
                  >
                    <div className="transition-transform duration-500 ease-snap hover:-translate-y-2">
                      <TradingCard {...card} />
                    </div>
                    {card.count > 1 && (
                      <span className="chamfer [--c:7px] absolute -left-2 -top-2 grid h-10 min-w-12 place-items-center bg-[image:var(--metal-gold)] px-2 font-display text-xl font-extrabold text-[#1a1204]">
                        ×{card.count}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )
          ) : userPacks.length === 0 ? (
            <EmptyState
              title="No sealed packs"
              body="Buy boosters in the store, then open them here."
              action={<Link href="/marketplace" className="btn btn-gold h-11 px-6 text-sm">Visit store</Link>}
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-5 gap-y-7 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
              {userPacks.map((pack, i) => (
                <motion.div
                  key={pack._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                >
                  <CardPack pack={pack} count={pack.count} onClick={() => setSelectedPack(pack)} />
                  <button
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className="btn btn-gold mt-3 h-10 w-full text-sm"
                  >
                    Open
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <PackOpeningOverlay isOpen={!!selectedPack} onClose={handleCloseOverlay} pack={selectedPack} />
    </GameShell>
  );
}
