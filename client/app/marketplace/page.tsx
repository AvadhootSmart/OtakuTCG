"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { getPacks, buyPack } from "@/api/marketplace";
import { CardPack } from "@/components/CardPack";
import { CardsPopup } from "@/components/CardsPopup";
import { AuthDialog } from "@/components/auth-dialog";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";
import { EmptyState, GameShell, PACK_ACCENT, RARITY_COLOR, ScreenHeader } from "@/components/game-shell";
import { useUserStore } from "@/store/useUserStore";
import { authClient } from "@/lib/auth-client";
import { IPack } from "@/types/pack";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function MarketplacePage() {
  const [packs, setPacks] = useState<IPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const { data: session } = authClient.useSession();
  const { profile, updateBalance, fetchProfile } = useUserStore();

  useEffect(() => {
    getPacks()
      .then((data) => {
        setPacks(data);
        setSelectedId(data[0]?._id ?? null);
      })
      .catch((err: Error) => console.error("Failed to fetch packs:", err))
      .finally(() => setLoading(false));
  }, []);

  const visible = packs.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const pack = packs.find((p) => p._id === selectedId) ?? null;
  const accent = pack ? PACK_ACCENT[pack.accentColor] ?? PACK_ACCENT.slate : PACK_ACCENT.slate;
  const shortBy = pack && profile ? pack.price - profile.balance : 0;

  const handleBuy = async () => {
    if (!pack) return;
    setIsBuying(true);
    try {
      const res = await buyPack(pack._id);
      updateBalance(res.balance);
      await fetchProfile();
      toast.success(`${pack.name} added to your collection`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to purchase pack");
    } finally {
      setIsBuying(false);
    }
  };

  const buyLabel = (
    <>
      {isBuying ? <Loader2 className="size-4 animate-spin" /> : <Coins className="size-4" strokeWidth={2} />}
      <span className="tabular-nums">{pack?.price.toLocaleString()}</span>
      <span className="opacity-60">·</span>
      Buy pack
    </>
  );

  const buyButton = !pack ? null : !session ? (
    <AuthDialog>
      <button type="button" className="btn btn-gold h-12 w-full text-base">Sign in to buy</button>
    </AuthDialog>
  ) : shortBy > 0 ? (
    <BuyCoinsDialog>
      <button type="button" className="btn btn-ghost h-12 w-full text-base">
        <Coins className="size-4 text-gold" strokeWidth={1.5} />
        Need {shortBy.toLocaleString()} more
      </button>
    </BuyCoinsDialog>
  ) : (
    <button type="button" disabled={isBuying} onClick={handleBuy} className="btn btn-gold h-12 w-full text-base">
      {buyLabel}
    </button>
  );

  return (
    <GameShell className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Pack shelf */}
      <section className="flex min-h-0 flex-1 flex-col px-5 pt-6 md:px-10 md:pt-8">
        <ScreenHeader eyebrow="Store" title="Booster packs">
          <label className="plate [--c:8px] flex h-10 w-full items-center gap-2 px-3 sm:w-64">
            <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packs"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </ScreenHeader>

        <div className="scroll-area fade-y -mx-2 mt-4 min-h-0 flex-1 px-2 pb-8 pt-4">
          {loading ? (
            <EmptyState title="Stocking shelves…" />
          ) : visible.length === 0 ? (
            <EmptyState title="No packs" body={query ? "Nothing matches that search." : "Check back soon for new drops."} />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-5 gap-y-7 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
              {visible.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: Math.min(i, 10) * 0.05, ease: EASE }}
                >
                  <CardPack pack={p} selected={p._id === selectedId} onClick={() => setSelectedId(p._id)} />
                  <div className="mt-3 flex items-center justify-between px-0.5">
                    <span className="flex items-center gap-1.5 font-display text-lg font-bold tabular-nums">
                      <Coins className="size-3.5 text-gold" strokeWidth={1.5} />
                      {p.price.toLocaleString()}
                    </span>
                    {p._id === selectedId && <span className="eyebrow text-[10px]">Selected</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pack detail */}
      <aside className="relative shrink-0 border-t border-white/[0.06] bg-[#0a0a0f]/80 lg:min-h-0 lg:border-l lg:border-t-0">
        <div className="pointer-events-none absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(80% 40% at 50% 0%, ${accent}1f, transparent 70%)` }} />
        <AnimatePresence mode="wait">
          {pack && (
            <motion.div
              key={pack._id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8"
            >
              <div className="scroll-area hidden min-h-0 flex-1 flex-col gap-6 lg:flex">
                <div className="mx-auto w-40 shrink-0 [@media(min-height:860px)]:w-48">
                  <CardPack pack={pack} selected />
                </div>
                <div>
                  <div className="eyebrow" style={{ color: accent }}>{pack.cards?.length ?? 0} possible cards</div>
                  <h2 className="mt-1 font-display text-4xl font-extrabold uppercase italic leading-[0.9]">{pack.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pack.description}</p>
                </div>

                {pack.rarity && (
                  <div>
                    <div className="eyebrow mb-3 text-muted-foreground">Drop rates</div>
                    <div className="space-y-2.5">
                      {(["legendary", "epic", "rare", "common"] as const).map((r) => (
                        <div key={r} className="grid grid-cols-[76px_1fr_40px] items-center gap-3">
                          <span className="font-display text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: RARITY_COLOR[r] }}>{r}</span>
                          <span className="h-1 bg-white/[0.06]">
                            <motion.span
                              className="block h-full"
                              style={{ background: RARITY_COLOR[r] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pack.rarity![r]}%` }}
                              transition={{ duration: 1, ease: EASE, delay: 0.15 }}
                            />
                          </span>
                          <span className="text-right font-display text-sm font-bold tabular-nums">{pack.rarity![r]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile summary */}
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="min-w-0">
                  <div className="eyebrow text-[10px]" style={{ color: accent }}>Selected</div>
                  <div className="truncate font-display text-2xl font-extrabold uppercase italic leading-none">{pack.name}</div>
                </div>
                <CardsPopup pack={pack}>
                  <button type="button" className="btn btn-ghost h-10 shrink-0 px-3 text-xs">
                    <Eye className="size-4" strokeWidth={1.5} /> Cards
                  </button>
                </CardsPopup>
              </div>

              <div className="space-y-2">
                <CardsPopup pack={pack}>
                  <button type="button" className="btn btn-ghost hidden h-11 w-full text-sm lg:inline-flex">
                    <Eye className="size-4" strokeWidth={1.5} /> View all cards
                  </button>
                </CardsPopup>
                {buyButton}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </GameShell>
  );
}
