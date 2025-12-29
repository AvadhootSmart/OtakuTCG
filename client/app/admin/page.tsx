"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCards, updateCard, deleteCard, createCard } from "@/api/cards";
import { ICard } from "@/types/card";
import { Loader2, Save, Trash2, Plus, Upload, Shield } from "lucide-react";
import { toast } from "sonner";
import { TradingCard } from "@/components/TradingCard";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function AdminPage() {
    const [cards, setCards] = useState<ICard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [editedCards, setEditedCards] = useState<Map<string, Partial<ICard>>>(new Map());
    const { data: session, isPending } = authClient.useSession();

    if (session?.user.name !== "Magnetic" && !isPending) {
        redirect("/");
    }


    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setIsLoading(true);
            const data = await getCards();
            setCards(data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch cards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFieldChange = (cardId: string, field: string, value: any) => {
        const currentEdits = editedCards.get(cardId) || {};

        // Handle nested attributes
        if (field.startsWith('attributes.')) {
            const attrField = field.split('.')[1];
            const card = cards.find(c => c._id === cardId);
            const baseAttributes = card?.attributes || {
                attack: 0,
                defense: 0,
                speed: 0,
                intelligence: 0,
                health: 0,
                energy: 0
            };
            const updatedAttributes = {
                ...baseAttributes,
                ...(currentEdits.attributes || {}),
                [attrField]: Number(value)
            };
            setEditedCards(new Map(editedCards.set(cardId, {
                ...currentEdits,
                attributes: updatedAttributes
            })));
        } else {
            setEditedCards(new Map(editedCards.set(cardId, {
                ...currentEdits,
                [field]: field === 'overall' || field === 'weight' ? Number(value) : value
            })));
        }
    };

    const handleSaveCard = async (cardId: string) => {
        const edits = editedCards.get(cardId);
        if (!edits) return;

        setSavingIds(new Set(savingIds.add(cardId)));
        try {
            const updated = await updateCard(cardId, edits);
            setCards(cards.map(c => c._id === cardId ? updated : c));
            const newEdits = new Map(editedCards);
            newEdits.delete(cardId);
            setEditedCards(newEdits);
            toast.success("Card updated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update card");
        } finally {
            const newSaving = new Set(savingIds);
            newSaving.delete(cardId);
            setSavingIds(newSaving);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!confirm("Are you sure you want to delete this card?")) return;

        try {
            await deleteCard(cardId);
            setCards(cards.filter(c => c._id !== cardId));
            toast.success("Card deleted successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete card");
        }
    };

    const getCardValue = (card: ICard, field: string) => {
        const edits = editedCards.get(card._id);
        if (field.startsWith('attributes.')) {
            const attrField = field.split('.')[1];
            return edits?.attributes?.[attrField as keyof typeof card.attributes] ?? card.attributes[attrField as keyof typeof card.attributes];
        }
        return edits?.[field as keyof ICard] ?? card[field as keyof ICard];
    };

    const hasEdits = (cardId: string) => editedCards.has(cardId);

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-background" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black rock-salt tracking-tighter">Admin Panel</h1>
                            <p className="text-sm text-muted-foreground font-medium">Manage your TCG assets</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <a href="/">Back to Home</a>
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <Tabs defaultValue="cards" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="cards">Cards</TabsTrigger>
                        <TabsTrigger value="packs">Packs</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cards" className="mt-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Bulk Card Editor</h2>
                                <Button onClick={fetchCards} variant="outline" size="sm">
                                    Refresh
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {cards.map((card) => (
                                        <div key={card._id} className="border rounded-lg p-6 bg-card">
                                            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                                                {/* Card Preview */}
                                                <div className="flex justify-center items-start">
                                                    <TradingCard
                                                        id={card._id}
                                                        name={getCardValue(card, 'name') as string}
                                                        overall={getCardValue(card, 'overall') as number}
                                                        attributes={{
                                                            attack: getCardValue(card, 'attributes.attack') as number,
                                                            defense: getCardValue(card, 'attributes.defense') as number,
                                                            speed: getCardValue(card, 'attributes.speed') as number,
                                                            intelligence: getCardValue(card, 'attributes.intelligence') as number,
                                                            health: getCardValue(card, 'attributes.health') as number,
                                                            energy: getCardValue(card, 'attributes.energy') as number,
                                                        }}
                                                        imageUrl={getCardValue(card, 'imageUrl') as string}
                                                        rarity={getCardValue(card, 'rarity') as any}
                                                    />
                                                </div>

                                                {/* Edit Form */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor={`name-${card._id}`}>Name</Label>
                                                            <Input
                                                                id={`name-${card._id}`}
                                                                value={getCardValue(card, 'name') as string}
                                                                onChange={(e) => handleFieldChange(card._id, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`overall-${card._id}`}>Overall</Label>
                                                            <Input
                                                                id={`overall-${card._id}`}
                                                                type="number"
                                                                value={String(getCardValue(card, 'overall'))}
                                                                onChange={(e) => handleFieldChange(card._id, 'overall', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor={`rarity-${card._id}`}>Rarity</Label>
                                                            <select
                                                                id={`rarity-${card._id}`}
                                                                value={getCardValue(card, 'rarity') as string}
                                                                onChange={(e) => handleFieldChange(card._id, 'rarity', e.target.value)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            >
                                                                <option value="common">Common</option>
                                                                <option value="rare">Rare</option>
                                                                <option value="epic">Epic</option>
                                                                <option value="legendary">Legendary</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`weight-${card._id}`}>Weight</Label>
                                                            <Input
                                                                id={`weight-${card._id}`}
                                                                type="number"
                                                                value={String(getCardValue(card, 'weight'))}
                                                                onChange={(e) => handleFieldChange(card._id, 'weight', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor={`image-${card._id}`}>Image URL</Label>
                                                        <Input
                                                            id={`image-${card._id}`}
                                                            value={getCardValue(card, 'imageUrl') as string}
                                                            onChange={(e) => handleFieldChange(card._id, 'imageUrl', e.target.value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">Attributes</Label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {['attack', 'defense', 'speed', 'intelligence', 'health', 'energy'].map((attr) => (
                                                                <div key={attr}>
                                                                    <Label htmlFor={`${attr}-${card._id}`} className="text-xs uppercase">{attr}</Label>
                                                                    <Input
                                                                        id={`${attr}-${card._id}`}
                                                                        type="number"
                                                                        value={String(getCardValue(card, `attributes.${attr}`))}
                                                                        onChange={(e) => handleFieldChange(card._id, `attributes.${attr}`, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-4">
                                                        <Button
                                                            onClick={() => handleSaveCard(card._id)}
                                                            disabled={!hasEdits(card._id) || savingIds.has(card._id)}
                                                            className="flex-1"
                                                        >
                                                            {savingIds.has(card._id) ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Save className="w-4 h-4 mr-2" />
                                                            )}
                                                            Save Changes
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteCard(card._id)}
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="packs" className="mt-8">
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Pack management coming soon...</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-8">
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Settings coming soon...</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
