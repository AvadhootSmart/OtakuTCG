"use client";

import { IPack } from "@/types/pack";
import { Coins, Eye, Sparkles, Loader2 } from "lucide-react";
import { CardsPopup } from "./CardsPopup";
import { buyPack } from "@/api/marketplace";
import { useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

interface CardPackProps {
  pack: IPack;
  variant?: "marketplace" | "bought";
  onOpen?: () => void;
}

export function CardPack({
  pack,
  variant = "marketplace",
  onOpen,
}: CardPackProps) {
  const [isBuying, setIsBuying] = useState(false);
  const { updateBalance, fetchProfile } = useUserStore();

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      const res = await buyPack(pack._id);
      updateBalance(res.balance);
      await fetchProfile(); // Update inventory
      toast.success(`Purchased ${pack.name}! New balance: ${res.balance}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to purchase pack");
    } finally {
      setIsBuying(false);
    }
  };

  const accentStyles =
    {
      blue: "from-blue-500 to-cyan-400 border-blue-500/50 shadow-blue-500/20",
      purple:
        "from-purple-600 to-pink-500 border-purple-500/50 shadow-purple-500/20",
      amber:
        "from-amber-500 to-yellow-400 border-amber-500/50 shadow-amber-500/20",
    }[pack.accentColor as "blue" | "purple" | "amber"] ||
    "from-slate-500 to-slate-400 border-slate-500/50 shadow-slate-500/20";

  return (
    <div className="w-full max-w-[320px] h-full">
      <div
        className={`h-full rounded-2xl border-2 bg-card overflow-hidden flex flex-col shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${accentStyles}`}
      >
        {/* Pack Image Header */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={pack.imageUrl}
            alt={pack.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-black rock-salt mb-1 line-clamp-1">
              {pack.name}
            </h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-80 line-clamp-2">
              {pack.description}
            </p>
          </div>

          {/* Odds Section - Small Rounded Card */}
          {pack.rarity && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Drop Rates
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(pack.rarity).map(([rarity, chance], idx) => {
                  const color =
                    {
                      common: "#9CA3AF",
                      rare: "#3B82F6",
                      epic: "#A855F7",
                      legendary: "#EAB308",
                    }[rarity] || "#FFFFFF";

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-tight opacity-70">
                          {rarity}
                        </span>
                      </div>
                      <span className="text-[10px] font-black">{chance}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Section */}
          <div className="mt-auto space-y-4 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-lg font-black tabular-nums">
                  {pack.price}
                </span>
              </div>
              <CardsPopup pack={pack}>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group/btn">
                  <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                  View Cards
                </div>
              </CardsPopup>
            </div>

            <button
              disabled={isBuying}
              onClick={(e) => {
                if (variant === "bought") {
                  e.stopPropagation();
                  onOpen?.();
                } else {
                  handleBuy();
                }
              }}
              className="w-full py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-tighter shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isBuying && <Loader2 className="w-4 h-4 animate-spin" />}
              {variant === "marketplace" ? `Buy Pack` : "Open Pack"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
