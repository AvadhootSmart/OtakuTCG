"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCards, updateCard, deleteCard, createCard, bulkCreateCards } from "@/api/cards";
import { getPacks, createPack, updatePack, deletePack, recalculateProbabilities } from "@/api/packs";
import { ICard } from "@/types/card";
import { IPack } from "@/types/pack";
import { Loader2, Save, Trash2, Plus, Upload, Shield, Package, LayoutGrid, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { TradingCard, TradingCardProps } from "@/components/TradingCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function AdminPage() {
    const [cards, setCards] = useState<ICard[]>([]);
    const [packs, setPacks] = useState<IPack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPacksLoading, setIsPacksLoading] = useState(false);
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [editedCards, setEditedCards] = useState<Map<string, Partial<ICard>>>(new Map());
    const [editingImageInputs, setEditingImageInputs] = useState<Map<string, string>>(new Map());

    // New Cards State
    const [isCreatingCards, setIsCreatingCards] = useState(false);
    const [newCardImageInputs, setNewCardImageInputs] = useState<string[]>([""]);
    const [newCards, setNewCards] = useState<Omit<ICard, '_id' | 'createdAt' | 'updatedAt'>[]>([
        {
            name: "New Card",
            overall: 80,
            rarity: "common",
            imageUrl: "",
            attributes: { attack: 70, defense: 70, speed: 70, intelligence: 70 },
            weight: 100
        }
    ]);

    // Pack Form State
    const [isEditingPack, setIsEditingPack] = useState(false);
    const [currentPack, setCurrentPack] = useState<Partial<IPack>>({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        cards: []
    });

    const { data: session, isPending } = authClient.useSession();

    if (session?.user.name !== "Magnetic" && !isPending) {
        redirect("/");
    }


    useEffect(() => {
        fetchCards();
        fetchPacks();
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

    const fetchPacks = async () => {
        try {
            setIsPacksLoading(true);
            const data = await getPacks();
            setPacks(data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch packs");
        } finally {
            setIsPacksLoading(false);
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
                intelligence: 0
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
        const edits = editedCards.get(cardId) || {};
        const pendingImage = editingImageInputs.get(cardId);

        const finalEdits = { ...edits };
        if (pendingImage) {
            finalEdits.imageUrl = pendingImage;
        }

        if (Object.keys(finalEdits).length === 0) return;

        setSavingIds(new Set(savingIds.add(cardId)));
        try {
            const updated = await updateCard(cardId, finalEdits);
            setCards(cards.map(c => c._id === cardId ? updated : c));

            const newEdits = new Map(editedCards);
            newEdits.delete(cardId);
            setEditedCards(newEdits);

            if (pendingImage) {
                const newImages = new Map(editingImageInputs);
                newImages.delete(cardId);
                setEditingImageInputs(newImages);
            }

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
        if (field === 'imageUrl' && editingImageInputs.has(card._id)) {
            return editingImageInputs.get(card._id);
        }
        if (field.startsWith('attributes.')) {
            const attrField = field.split('.')[1];
            return edits?.attributes?.[attrField as keyof typeof card.attributes] ?? card.attributes[attrField as keyof typeof card.attributes];
        }
        return edits?.[field as keyof ICard] ?? card[field as keyof ICard];
    };

    const handleConfirmEditImage = (cardId: string) => {
        const value = editingImageInputs.get(cardId);
        if (value !== undefined) {
            handleFieldChange(cardId, 'imageUrl', value);
        }
    };


    const hasEdits = (cardId: string) => editedCards.has(cardId) || editingImageInputs.has(cardId);

    const handlePackFormChange = (field: string, value: any) => {
        setCurrentPack({ ...currentPack, [field]: value });
    };

    const toggleCardInPack = (cardId: string) => {
        const currentCards = (currentPack.cards || []) as string[];
        if (currentCards.includes(cardId)) {
            setCurrentPack({
                ...currentPack,
                cards: currentCards.filter(id => id !== cardId)
            });
        } else {
            setCurrentPack({
                ...currentPack,
                cards: [...currentCards, cardId]
            });
        }
    };

    const handleSavePack = async () => {
        if (!currentPack.name || !currentPack.price) {
            toast.error("Name and Price are required");
            return;
        }

        try {
            if (currentPack._id) {
                const updated = await updatePack(currentPack._id, currentPack);
                setPacks(packs.map(p => p._id === currentPack._id ? updated : p));
                toast.success("Pack updated successfully");
            } else {
                const created = await createPack(currentPack);
                setPacks([...packs, created]);
                toast.success("Pack created successfully");
            }
            setIsEditingPack(false);
            setCurrentPack({ name: "", description: "", price: 0, imageUrl: "", cards: [] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save pack");
        }
    };

    const handleEditPack = (pack: IPack) => {
        setCurrentPack({
            ...pack,
            cards: (pack.cards as any[]).map(c => typeof c === 'string' ? c : c._id)
        });
        setIsEditingPack(true);
    };

    const handleDeletePack = async (packId: string) => {
        if (!confirm("Are you sure you want to delete this pack?")) return;
        try {
            await deletePack(packId);
            setPacks(packs.filter(p => p._id !== packId));
            toast.success("Pack deleted successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete pack");
        }
    };

    const handleAddNewCardRow = () => {
        setNewCards([...newCards, {
            name: "New Card",
            overall: 80,
            rarity: "common",
            imageUrl: "",
            attributes: { attack: 70, defense: 70, speed: 70, intelligence: 70 },
            weight: 100
        }]);
        setNewCardImageInputs([...newCardImageInputs, ""]);
    };

    const handleRemoveNewCardRow = (index: number) => {
        setNewCards(newCards.filter((_, i) => i !== index));
        setNewCardImageInputs(newCardImageInputs.filter((_, i) => i !== index));
    };

    const handleNewCardChange = (index: number, field: string, value: any) => {
        const updated = [...newCards];
        if (field.startsWith('attributes.')) {
            const attrField = field.split('.')[1];
            updated[index].attributes = {
                ...updated[index].attributes,
                [attrField]: Number(value)
            };
        } else {
            (updated[index] as any)[field] = field === 'overall' || field === 'weight' ? Number(value) : value;
        }
        setNewCards(updated);
    };

    const handleConfirmNewCardImage = (index: number) => {
        handleNewCardChange(index, 'imageUrl', newCardImageInputs[index]);
    };


    const handleCreateCards = async () => {
        const cardsToSubmit = newCards.map((card, i) => ({
            ...card,
            imageUrl: newCardImageInputs[i] || card.imageUrl
        }));

        if (cardsToSubmit.some(c => !c.name || !c.imageUrl)) {
            toast.error("All cards must have a name and image URL");
            return;
        }

        const toastId = toast.loading("Creating cards...");
        try {
            const res = await bulkCreateCards(cardsToSubmit);
            toast.success(res.message, { id: toastId });
            setIsCreatingCards(false);
            setNewCards([{
                name: "New Card",
                overall: 80,
                rarity: "common",
                imageUrl: "",
                attributes: { attack: 70, defense: 70, speed: 70, intelligence: 70 },
                weight: 100
            }]);
            setNewCardImageInputs([""]);
            fetchCards();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create cards", { id: toastId });
        }
    };

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
                                <div className="flex gap-2">
                                    <Button onClick={fetchCards} variant="outline" size="sm">
                                        Refresh
                                    </Button>
                                    {!isCreatingCards && (
                                        <Button onClick={() => setIsCreatingCards(true)} size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add New Cards
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isCreatingCards && (
                                <div className="border rounded-xl p-8 bg-card shadow-lg space-y-8 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">Create New Cards</h3>
                                            <p className="text-sm text-muted-foreground">Add multiple cards at once using bulk creation</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsCreatingCards(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {newCards.map((card, index) => (
                                            <div key={index} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-6 border rounded-xl bg-black/20 relative group">

                                                {/* Live Preview */}
                                                <div className="flex justify-center items-start">
                                                    <TradingCard
                                                        id={`new-${index}`}
                                                        name={card.name}
                                                        overall={card.overall}
                                                        rarity={card.rarity}
                                                        imageUrl={newCardImageInputs[index] || card.imageUrl}
                                                        attributes={card.attributes}
                                                    />
                                                </div>

                                                {/* Edit Form */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Name</Label>
                                                            <Input value={card.name} onChange={(e) => handleNewCardChange(index, 'name', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Rarity</Label>
                                                            <select
                                                                value={card.rarity}
                                                                onChange={(e) => handleNewCardChange(index, 'rarity', e.target.value)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            >
                                                                <option value="common">Common</option>
                                                                <option value="rare">Rare</option>
                                                                <option value="epic">Epic</option>
                                                                <option value="legendary">Legendary</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Overall</Label>
                                                            <Input type="number" value={card.overall} onChange={(e) => handleNewCardChange(index, 'overall', e.target.value)} />
                                                        </div>
                                                        <div className="col-span-1 lg:col-span-2 space-y-2">
                                                            <Label>Image URL</Label>
                                                            <Input
                                                                value={newCardImageInputs[index]}
                                                                onChange={(e) => {
                                                                    const updated = [...newCardImageInputs];
                                                                    updated[index] = e.target.value;
                                                                    setNewCardImageInputs(updated);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Weight</Label>
                                                            <Input type="number" value={card.weight} onChange={(e) => handleNewCardChange(index, 'weight', e.target.value)} />
                                                        </div>
                                                        <div className="col-span-full grid grid-cols-4 gap-2">
                                                            {['attack', 'defense', 'speed', 'intelligence'].map((attr) => (
                                                                <div key={attr} className="space-y-1">
                                                                    <Label className="text-[10px] uppercase">{attr}</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={(card.attributes as any)[attr]}
                                                                        onChange={(e) => handleNewCardChange(index, `attributes.${attr}`, e.target.value)}
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-4">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleRemoveNewCardRow(index)}
                                                            disabled={newCards.length === 1}
                                                            title="Remove Card"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={handleAddNewCardRow} className="flex-1">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Another Card
                                            </Button>
                                            <Button onClick={handleCreateCards} className="flex-1">
                                                <Save className="w-4 h-4 mr-2" />
                                                Save All Cards
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                            onChange={(e) => {
                                                                setEditingImageInputs(new Map(editingImageInputs.set(card._id, e.target.value)));
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">Attributes</Label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {['attack', 'defense', 'speed', 'intelligence'].map((attr) => (
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
                                                            size="icon"
                                                            title="Delete Card"
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
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Pack Management</h2>
                                <div className="flex gap-2">
                                    <Button onClick={fetchPacks} variant="outline" size="sm">
                                        Refresh
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            const toastId = toast.loading("Recalculating probabilities...");
                                            try {
                                                const res = await recalculateProbabilities();
                                                toast.success(res.message, { id: toastId });
                                                fetchPacks();
                                            } catch (error: any) {
                                                toast.error(error.response?.data?.error || "Failed to recalculate", { id: toastId });
                                            }
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Recalculate
                                    </Button>
                                    {!isEditingPack && (
                                        <Button onClick={() => {
                                            setIsEditingPack(true);
                                            setCurrentPack({ name: "", description: "", price: 0, imageUrl: "", cards: [] });
                                        }} size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Pack
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEditingPack ? (
                                <div className="border rounded-xl p-8 bg-card shadow-lg space-y-8 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{currentPack._id ? "Edit Pack" : "Create New Pack"}</h3>
                                            <p className="text-sm text-muted-foreground">Configure your pack and select cards to include</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditingPack(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={currentPack.name}
                                                        onChange={(e) => handlePackFormChange('name', e.target.value)}
                                                        placeholder="Starter Pack"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price (Coins)</Label>
                                                    <Input
                                                        type="number"
                                                        value={currentPack.price}
                                                        onChange={(e) => handlePackFormChange('price', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={currentPack.description}
                                                    onChange={(e) => handlePackFormChange('description', e.target.value)}
                                                    placeholder="A great pack for beginners..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Image URL</Label>
                                                <Input
                                                    value={currentPack.imageUrl}
                                                    onChange={(e) => handlePackFormChange('imageUrl', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            <div className="pt-4 flex gap-3">
                                                <Button onClick={handleSavePack} className="flex-1">
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {currentPack._id ? "Update Pack" : "Create Pack"}
                                                </Button>
                                                <Button variant="outline" onClick={() => setIsEditingPack(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-lg font-bold">Select Cards ({(currentPack.cards as string[]).length} selected)</Label>
                                                <div className="flex gap-3 px-2 py-1 bg-muted rounded text-[8px] font-bold uppercase tracking-tighter">
                                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Common</div>
                                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Rare</div>
                                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Epic</div>
                                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Legendary</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded inline-block mb-2">Click cards to toggle</div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-12 h-[400px] overflow-y-auto p-4 border rounded-lg bg-black/20">
                                                {cards.map((card) => {
                                                    const isSelected = (currentPack.cards as string[]).includes(card._id);
                                                    return (
                                                        <div
                                                            key={card._id}
                                                            onClick={() => toggleCardInPack(card._id)}
                                                            className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${isSelected
                                                                ? "border-blue-500 ring-2 ring-blue-500/50 scale-95"
                                                                : "border-transparent opacity-60 hover:opacity-100"
                                                                }`}
                                                        >
                                                            <Image
                                                                src={card.imageUrl}
                                                                alt={card.name}
                                                                className="w-full h-full object-cover"
                                                                fill
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[8px] font-bold text-center truncate flex flex-col items-center">
                                                                <span className="truncate w-full">{card.name}</span>
                                                                <span className={`text-[6px] uppercase tracking-tighter ${card.rarity === 'legendary' ? 'text-amber-400' :
                                                                    card.rarity === 'epic' ? 'text-purple-400' :
                                                                        card.rarity === 'rare' ? 'text-blue-400' :
                                                                            'text-slate-400'
                                                                    }`}>
                                                                    {card.rarity}
                                                                </span>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
                                                                    <Plus className="w-3 h-3 text-white rotate-45" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isPacksLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {packs.map((pack) => (
                                                <div key={pack._id} className="border rounded-xl p-6 bg-card flex flex-col gap-4 relative group">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-white/5 relative">
                                                            {pack.imageUrl ? (
                                                                <Image src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover" fill />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-8 h-8 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-lg truncate">{pack.name}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{pack.description}</p>
                                                            <div className="inline-flex items-center px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold">
                                                                {pack.price} Coins
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                                                        <span>{pack.cards.length} Cards included</span>
                                                        <div className="flex gap-1">
                                                            <Button size="sm" variant="outline" onClick={() => handleEditPack(pack)}>
                                                                Edit
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDeletePack(pack._id)}>
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {packs.length === 0 && (
                                                <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl">
                                                    <p className="text-muted-foreground">No packs found. Create your first one!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
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
