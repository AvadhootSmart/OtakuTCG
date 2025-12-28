"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { TradingCard } from "./TradingCard";
import { cards } from "../static_data/cards";

interface CardsPopupProps {
    children: React.ReactNode;
    packName: string;
}

export function CardsPopup({ children, packName }: CardsPopupProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-4xl font-black rock-salt tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center">
                            <span className="text-background text-2xl">?</span>
                        </div>
                        <div>
                            <span className="block">{packName}</span>
                            <span className="text-sm font-medium text-muted-foreground rock-salt opacity-60">Possible Card Drops</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 pb-12 justify-items-center">
                    {cards.map((card, idx) => (
                        <div key={idx} className="scale-90 hover:scale-100 transition-all duration-500 hover:-translate-y-2">
                            <TradingCard {...card} />
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
