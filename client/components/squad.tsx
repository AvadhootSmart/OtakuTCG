"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
import { RARITY_COLOR, RARITY_ORDER } from "@/components/game-shell";
import { ICard } from "@/types/card";
import { cn } from "@/lib/utils";

/** Fixed number of squad slots. Square thumbs on mobile, detailed rows on desktop. */
export function SquadSlots({ cards, max, onRemove }: { cards: ICard[]; max: number; onRemove: (id: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2 lg:grid-cols-1">
      {Array.from({ length: max }).map((_, i) => {
        const card = cards[i];
        if (!card) {
          return (
            <div
              key={`empty-${i}`}
              className="grid aspect-square place-items-center border border-dashed border-white/10 font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-white/20 lg:aspect-auto lg:h-16"
            >
              <span className="hidden lg:inline">Slot {i + 1}</span>
              <span className="lg:hidden">{i + 1}</span>
            </div>
          );
        }
        const color = RARITY_COLOR[card.rarity];
        return (
          <motion.div
            key={card._id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="plate [--c:8px] group relative flex aspect-square items-center gap-3 p-[2px] lg:aspect-auto lg:h-16 lg:p-2 lg:pr-3"
          >
            <div className="chamfer [--c:6px] relative size-full shrink-0 overflow-hidden lg:size-12">
              <Image src={card.imageUrl} alt={card.name} fill sizes="48px" className="object-cover object-top" />
              <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: color }} />
            </div>
            <div className="hidden min-w-0 flex-1 lg:block">
              <div className="truncate font-display text-lg font-bold uppercase leading-none">{card.name}</div>
              <div className="mt-1 flex gap-3 font-display text-[11px] font-semibold uppercase tracking-[0.18em]">
                <span style={{ color }}>{card.rarity}</span>
                <span className="text-muted-foreground">OVR {card.overall}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(card._id)}
              aria-label={`Remove ${card.name}`}
              className="absolute right-0.5 top-0.5 grid size-6 place-items-center bg-ink/80 text-muted-foreground transition-colors duration-300 hover:text-destructive lg:static lg:size-8 lg:bg-transparent"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Scrollable grid of the player's cards; tapping toggles squad membership. */
export function CardPicker({
  owned,
  isPicked,
  onToggle,
  isDisabled,
}: {
  owned: { cardId: ICard; count: number }[];
  isPicked: (card: ICard) => boolean;
  onToggle: (card: ICard) => void;
  isDisabled?: (card: ICard) => boolean;
}) {
  const cards = owned
    .filter((o) => o.cardId)
    .sort((a, b) => RARITY_ORDER[b.cardId.rarity] - RARITY_ORDER[a.cardId.rarity] || b.cardId.overall - a.cardId.overall);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] justify-items-center gap-x-3 gap-y-5 md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))]">
      {cards.map(({ cardId: card }) => {
        const picked = isPicked(card);
        return (
          <button
            key={card._id}
            type="button"
            onClick={() => onToggle(card)}
            disabled={isDisabled?.(card)}
            className="group relative [zoom:0.52] disabled:cursor-not-allowed md:[zoom:0.65]"
          >
            <div
              className={cn(
                "transition-[transform,opacity,filter] duration-500 ease-snap",
                picked ? "scale-[0.94] opacity-40 grayscale" : "group-hover:-translate-y-2",
              )}
            >
              <TradingCard {...card} />
            </div>
            {picked && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="chamfer [--c:10px] flex items-center gap-2 bg-[image:var(--metal-gold)] px-5 py-2.5 font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-[#1a1204]">
                  <Check className="size-6" strokeWidth={2.5} /> In squad
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const STAT_LABELS = [
  { key: "attack", label: "ATK" },
  { key: "defense", label: "DEF" },
  { key: "speed", label: "SPD" },
  { key: "intelligence", label: "INT" },
] as const;

export function SquadTotals({ cards }: { cards: ICard[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {STAT_LABELS.map((s) => (
        <div key={s.key} className="border-l border-white/10 pl-3">
          <div className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
          <div className="font-display text-2xl font-bold tabular-nums leading-tight">
            {cards.reduce((n, c) => n + c.attributes[s.key], 0)}
          </div>
        </div>
      ))}
    </div>
  );
}
