"use client";

import { useState, useEffect } from "react";
import { getPacks, IPack } from "@/api/marketplace";
import { CardPack } from "../../components/CardPack";
import { ThemeToggle } from "../../components/theme-toggle";
import { Sparkles, Compass, Search, Filter, Coins } from "lucide-react";
import { FeaturedBundle } from "@/components/featured-bundle";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";
import { useUserStore } from "@/store/useUserStore";
import { authClient } from "@/lib/auth-client";

export default function ExplorePage() {
  const [packs, setPacks] = useState<IPack[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    getPacks()
      .then((data: IPack[]) => {
        setPacks(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch packs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-black rock-salt tracking-tighter">
              Marketplace
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Discover new card packs & expansions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search packs..."
              className="w-full bg-card border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
            />
          </div>
          <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <BuyCoinsDialog>
            <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> {profile?.balance}
            </button>
          </BuyCoinsDialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Hero Section */}

        <FeaturedBundle />

        <div className="mb-10 flex items-center justify-between">
          <h3 className="text-2xl font-black rock-salt">Available Packs</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase">
              All Packs
            </span>
            <span className="px-3 py-1 hover:bg-muted rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer text-muted-foreground">
              Seasonal
            </span>
            <span className="px-3 py-1 hover:bg-muted rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer text-muted-foreground">
              Limited Edition
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 justify-items-center">
          {loading ? (
            <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">
              Loading epic packs...
            </div>
          ) : packs.length > 0 ? (
            packs.map((pack: IPack) => (
              <CardPack key={pack._id} pack={pack as any} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No packs available at the moment.
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border text-center text-muted-foreground text-sm">
        <p>© 2024 OtakuTCG Asset Marketplace</p>
      </footer>
    </div>
  );
}
