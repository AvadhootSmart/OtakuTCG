"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { TradingCard } from "./TradingCard";
import { IPack } from "@/types/pack";
import { RARITY_ORDER } from "./game-shell";

interface CardsPopupProps {
  children: React.ReactNode;
  pack: IPack;
}

export function CardsPopup({ children, pack }: CardsPopupProps) {
  const cards = [...(pack.cards ?? [])].sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || b.overall - a.overall);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="text-left">
          <div className="eyebrow">Possible pulls · {cards.length}</div>
          <DialogTitle className="text-4xl italic">{pack.name}</DialogTitle>
          <DialogDescription>{pack.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(179px,1fr))] justify-items-center gap-x-3 gap-y-5 pt-2">
          {cards.map((card) => (
            <div key={card._id} className="[zoom:0.62] transition-transform duration-500 ease-snap hover:-translate-y-2">
              <TradingCard {...card} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
