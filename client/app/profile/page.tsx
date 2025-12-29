"use client";

import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { TradingCard } from "../../components/TradingCard";
import { CardPack } from "../../components/CardPack";
import {
  Sparkles,
  Package,
  LayoutGrid,
  Coins,
  Trophy,
  Star,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { motion } from "motion/react";

import { useUserStore } from "@/store/useUserStore";
import { PackOpeningOverlay } from "../../components/PackOpeningOverlay";
import { IPack } from "@/types/pack";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";

export default function ProfilePage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { profile, isLoading: loading, fetchProfile } = useUserStore();
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [selectedPack, setSelectedPack] = useState<IPack | null>(null);

  useEffect(() => {
    if (!sessionPending && !session) {
      window.location.href = "/";
      return;
    }

    if (session) {
      fetchProfile();
    }
  }, [session, sessionPending, fetchProfile]);

  const handleOpenPack = (pack: IPack) => {
    setSelectedPack(pack);
    setIsOpeningPack(true);
  };

  const handleCloseOverlay = () => {
    setIsOpeningPack(false);
    setSelectedPack(null);
    fetchProfile(); // Refresh to show new card
  };

  if (sessionPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const userCards =
    profile?.ownedCards
      ?.filter((oc: any) => oc.cardId !== null)
      .map((oc: any) => ({
        ...oc.cardId,
        count: oc.count,
      })) || [];

  const userPacks =
    profile?.inventoryPacks
      ?.filter((ip: any) => ip.packId !== null)
      .map((ip: any) => ({
        ...ip.packId,
        count: ip.count,
      })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header / Stats Bar */}
      <div className="relative h-60 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-background to-amber-900/40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 invert dark:invert-0 brightness-100 contrast-150" />

        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-between py-10">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ml-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[22px] bg-background flex items-center justify-center border border-white/10">
                    <span className="text-4xl font-black rock-salt uppercase opacity-50">
                      {session?.user.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-foreground text-background text-xs font-black px-3 py-1 rounded-full border-2 border-background shadow-lg">
                  LVL {profile?.level || 1}
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black rock-salt tracking-tighter mb-3">
                  {session?.user.name}
                </h1>
                <p className="text-muted-foreground text-sm font-medium opacity-70 flex items-center gap-2">
                  Member since{" "}
                  {new Date(
                    session?.user.createdAt || Date.now(),
                  ).getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <BuyCoinsDialog>
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 cursor-pointer rounded-3xl flex items-center justify-center p-2 shadow-2xl gap-2 min-w-30">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="text-2xl font-black">
                    {profile?.balance || 0}
                  </span>
                </div>
              </BuyCoinsDialog>
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center p-2 shadow-2xl gap-2">
                <Trophy className="w-6 h-6 text-purple-500" />
                <span className="text-2xl font-black">
                  {profile?.stats?.matchesWon || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 mt-16 space-y-24">
        {/* Inventory Packs */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black rock-salt">Inventory</h2>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">
                  Unopened Booster Packs
                </p>
              </div>
              <div className="ml-4 py-1 px-3 bg-muted rounded-full text-[10px] font-black opacity-50 border border-border">
                {userPacks.length}
              </div>
            </div>
          </div>

          {userPacks.length > 0 ? (
            <div className="flex overflow-x-auto pb-8 gap-8 px-4 -mx-4 scrollbar-hide">
              {userPacks.map((pack: any, idx: number) => (
                <motion.div
                  key={`${idx}-${pack._id}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: "easeOut",
                  }}
                  className="min-w-[320px] relative"
                >
                  <CardPack pack={pack} variant="bought" onOpen={() => handleOpenPack(pack)} />
                  {pack.count > 1 && (
                    <div className="absolute -top-3 -right-2 z-40 bg-amber-500 text-black w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 border-background rotate-12">
                      x{pack.count}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[40px] overflow-hidden bg-[#0a0a0a] border border-amber-500/20 text-white p-8 md:p-12 shadow-2xl"
            >
              {/* Theme-specific gradient glow */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest mb-6 text-amber-500">
                  <Package className="w-3 h-3" />
                  Inventory Empty
                </div>
                <h2 className="text-4xl md:text-5xl font-black rock-salt leading-tight mb-4 text-white">
                  Your <span className="text-amber-500">Vault</span> is Empty
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
                  You don't have any unopened packs right now. Head over to the
                  marketplace to discover epic warriors and rare monsters.
                </p>
                <Link href="/marketplace">
                  <button className="px-8 py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
                    Back to Marketplace
                  </button>
                </Link>
              </div>

              {/* Abstract background elements - themed */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[50px] border-amber-500 rounded-full" />
                <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] border-[20px] border-amber-500 rounded-full" />
              </div>
            </motion.div>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner">
                <LayoutGrid className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black rock-salt">My Cards</h2>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">
                  Digital Collection Library
                </p>
              </div>
              <div className="ml-4 py-1 px-3 bg-muted rounded-full text-[10px] font-black opacity-50 border border-border">
                {userCards.length}
              </div>
            </div>
          </div>

          {userCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16">
              {userCards.map((card: any, idx: number) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="relative flex justify-center"
                >
                  <TradingCard {...card} />
                  {card.count > 1 && (
                    <div className="absolute -top-3 -right-2 z-40 bg-foreground text-background w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 border-background rotate-12">
                      x{card.count}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[40px] overflow-hidden bg-[#0a0a0a] border border-purple-500/20 text-white p-8 md:p-12 shadow-2xl"
            >
              {/* Theme-specific gradient glow */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest mb-6 text-purple-500">
                  <Star className="w-3 h-3" />
                  Collection Empty
                </div>
                <h2 className="text-4xl md:text-5xl font-black rock-salt leading-tight mb-4 text-white">
                  Start Your <span className="text-purple-500">Legend</span>
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
                  Your card library is looking a bit lonely. Time to summon some
                  legendary warriors and build your ultimate deck!
                </p>
                <Link href="/marketplace">
                  <button className="px-8 py-4 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-500 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter shadow-[0_10px_30px_rgba(147,51,234,0.3)]">
                    Visit Store Marketplace
                  </button>
                </Link>
              </div>

              {/* Abstract background elements - themed */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[50px] border-purple-500 rounded-full" />
                <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] border-[20px] border-purple-500 rounded-full" />
              </div>
            </motion.div>
          )}
        </section>
      </main>

      <PackOpeningOverlay
        isOpen={isOpeningPack}
        onClose={handleCloseOverlay}
        pack={selectedPack}
      />
    </div>
  );
}
