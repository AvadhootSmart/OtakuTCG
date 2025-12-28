"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { buyCurrency } from "@/api/user";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BuyCoinsDialogProps {
    children: React.ReactNode;
}

const coinOptions = [
    { amount: 500, price: "$4.99", label: "Starter Pouch", color: "bg-slate-500/10 text-slate-500" },
    { amount: 1200, price: "$9.99", label: "Warrior's Sack", color: "bg-blue-500/10 text-blue-500", popular: true },
    { amount: 3000, price: "$24.99", label: "Merchant's Chest", color: "bg-purple-500/10 text-purple-500" },
    { amount: 7500, price: "$49.99", label: "Emperor's Vault", color: "bg-amber-500/10 text-amber-500" },
];

export function BuyCoinsDialog({ children }: BuyCoinsDialogProps) {
    const [loading, setLoading] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const { updateBalance } = useUserStore();

    const handleBuy = async (amount: number) => {
        setLoading(amount);
        try {
            const res = await buyCurrency(amount);
            updateBalance(res.balance);
            toast.success(`Succesfully added ${amount} coins to your balance!`);
            // Optional: keep open to show success or close immediately
            setTimeout(() => setOpen(false), 800);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to purchase coins");
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-background border-border/50 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

                <DialogHeader className="pt-6 px-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black rock-salt tracking-tighter">Get More Coins</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">
                                Enhance your collection and unlock legendary warriors.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 p-6">
                    {coinOptions.map((option) => (
                        <button
                            key={option.amount}
                            disabled={loading !== null}
                            onClick={() => handleBuy(option.amount)}
                            className={`relative group flex flex-col items-center justify-center p-6 rounded-[24px] border border-border/50 hover:border-amber-500/50 hover:bg-amber-500/[0.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${option.popular ? 'ring-2 ring-amber-500/20' : ''}`}
                        >
                            {option.popular && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-[8px] font-black text-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                    Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${option.color} group-hover:scale-110 transition-transform`}>
                                <Coins className="w-6 h-6" />
                            </div>

                            <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{option.label}</span>
                            <span className="text-2xl font-black mb-1">{option.amount}</span>
                            <span className="text-xs font-bold text-muted-foreground">{option.price}</span>

                            <AnimatePresence>
                                {loading === option.amount && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                                    >
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>

                <div className="bg-muted/30 p-4 mx-6 mb-6 rounded-2xl border border-border/50 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                        All purchases are final. Coins are added directly to your account balance for use in the marketplace and pack openings.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
