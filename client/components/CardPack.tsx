"use client";

import { IPack } from "@/types/pack";
import { PACK_ACCENT } from "@/components/game-shell";
import { cn } from "@/lib/utils";

interface CardPackProps {
  pack: IPack;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

// Foil crimp at the top and bottom of a booster.
const CRIMP = "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 1.5px, rgba(0,0,0,0.25) 1.5px 3px, transparent 3px 5px)";

/** A sealed booster pack. Purely visual; fills its container's width. */
export function CardPack({ pack, selected, count, onClick, className }: CardPackProps) {
  const accent = PACK_ACCENT[pack.accentColor] ?? PACK_ACCENT.slate;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative block aspect-[5/7.4] w-full text-left outline-none", className)}
      style={{ filter: selected ? `drop-shadow(0 0 18px ${accent}66)` : "drop-shadow(0 14px 18px rgba(0,0,0,0.5))" }}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-700 ease-snap",
          selected ? "-translate-y-2" : "group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5",
        )}
      >
        {/* Frame */}
        <div
          className="chamfer [--c:12px] absolute inset-0"
          style={{ background: `linear-gradient(150deg, ${accent}, #0b0b10 38%, #0b0b10 62%, ${accent})` }}
        />
        <div className="chamfer [--c:11px] absolute inset-[1.5px] overflow-hidden bg-[#0b0b10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pack.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-snap group-hover:scale-[1.06]"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${accent}40, transparent 30%, transparent 45%, #07070bf2 88%)` }}
          />
          {/* Holo sheen */}
          <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)] transition-transform duration-[1100ms] ease-snap group-hover:translate-x-full" />

          <div className="absolute inset-x-0 top-0 h-[6%]" style={{ background: `${CRIMP}, linear-gradient(${accent}cc, ${accent}55)` }} />
          <div className="absolute inset-x-0 bottom-0 h-[6%]" style={{ background: `${CRIMP}, linear-gradient(${accent}55, ${accent}cc)` }} />

          <div className="absolute inset-x-0 top-[8%] flex items-center justify-center gap-2">
            <span className="h-px w-5" style={{ background: accent }} />
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">Booster</span>
            <span className="h-px w-5" style={{ background: accent }} />
          </div>

          <div className="absolute inset-x-0 bottom-[9%] px-3.5">
            <div className="font-display text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>
              {pack.cards?.length ?? 0} cards
            </div>
            <div className="font-display text-2xl font-extrabold uppercase italic leading-[0.95] tracking-tight text-white line-clamp-2">
              {pack.name}
            </div>
          </div>
        </div>
      </div>

      {count !== undefined && count > 1 && (
        <span className="chamfer [--c:5px] absolute -right-1.5 -top-1.5 z-10 grid h-7 min-w-9 place-items-center bg-[image:var(--metal-gold)] px-2 font-display text-sm font-extrabold text-[#1a1204]">
          ×{count}
        </span>
      )}
    </button>
  );
}
