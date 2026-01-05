"use client";

import { useState, useEffect } from "react";
import { TradingCard } from "@/components/TradingCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, Package, Loader2 } from "lucide-react";
import { CardPack } from "../../components/CardPack";
import { packs, CardPack as PackType } from "../../static_data/packs";
import { PackOpeningOverlay } from "../../components/PackOpeningOverlay";
import { getCards } from "@/api/cards";
import { ICard } from "@/types/card";

export default function ShowcasePage() {
    const [openingPack, setOpeningPack] = useState<PackType | null>(null);
    const [cards, setCards] = useState<ICard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                setIsLoading(true);
                const data = await getCards();
                setCards(data);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch cards");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCards();
    }, []);

    const raritySortedCards = [...cards].sort((a, b) => {
        const order: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return (order[b.rarity.toLowerCase()] || 0) - (order[a.rarity.toLowerCase()] || 0);
    });

    return (
        <div className="min-h-screen bg-background p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-background" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black rock-salt tracking-tighter">Inventory Showcase</h1>
                        <p className="text-sm text-muted-foreground font-medium">Manage your collection & open packs</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/" className="text-sm font-bold hover:underline">Back to Home</a>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-20">
                {/* Packs Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Package className="w-6 h-6" />
                        <h2 className="text-2xl font-black rock-salt">Unopened Packs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center bg-muted/20 p-8 rounded-3xl border-2 border-dashed border-border">
                        {packs.slice(0, 3).map((pack: PackType) => (
                            <CardPack
                                key={pack.id}
                                pack={pack as any}
                                variant="bought"
                                onOpen={() => setOpeningPack(pack)}
                            />
                        ))}
                    </div>
                </section>

                {/* Cards Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="w-6 h-6" />
                        <h2 className="text-2xl font-black rock-salt">All Cards</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground font-medium">No cards available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 justify-items-center">
                            {raritySortedCards.map((card: ICard) => (
                                <div key={card._id} className="flex flex-col items-center gap-4">
                                    <TradingCard
                                        id={card._id}
                                        name={card.name}
                                        overall={card.overall}
                                        attributes={card.attributes}
                                        imageUrl={card.imageUrl}
                                        rarity={card.rarity}
                                    />
                                    <div className="text-center">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-border bg-card shadow-sm`}>
                                            {card.rarity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border text-center text-muted-foreground text-sm">
                <p>© 2024 OtakuTCG Asset Preview System</p>
            </footer>

            {/* Pack Opening Experience */}
            <PackOpeningOverlay
                isOpen={!!openingPack}
                onClose={() => setOpeningPack(null)}
                pack={openingPack as any}
            />
        </div>
    );
}
