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
import { Coins, Loader2 } from "lucide-react";
import { buyCurrency } from "@/api/user";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface BuyCoinsDialogProps {
    children: React.ReactNode;
}

const coinOptions = [
    { amount: 500, price: "$4.99", label: "Starter Pouch" },
    { amount: 1200, price: "$9.99", label: "Warrior's Sack", popular: true },
    { amount: 3000, price: "$24.99", label: "Merchant's Chest" },
    { amount: 7500, price: "$49.99", label: "Emperor's Vault" },
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
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader className="text-left">
                    <div className="eyebrow">Treasury</div>
                    <DialogTitle className="text-4xl italic">Get more coins</DialogTitle>
                    <DialogDescription>Coins buy booster packs in the store.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                    {coinOptions.map((option, i) => (
                        <button
                            key={option.amount}
                            disabled={loading !== null}
                            onClick={() => handleBuy(option.amount)}
                            className={`plate [--c:12px] group flex flex-col items-start p-4 text-left transition-transform duration-500 ease-snap hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${option.popular ? "plate-gold" : ""}`}
                        >
                            <div className="flex w-full items-center justify-between">
                                <span className="flex gap-0.5">
                                    {Array.from({ length: i + 1 }).map((_, j) => (
                                        <Coins key={j} className="size-3.5 text-gold" strokeWidth={1.5} />
                                    ))}
                                </span>
                                {option.popular && (
                                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Best value</span>
                                )}
                            </div>
                            <span className="mt-5 font-display text-4xl font-extrabold leading-none tabular-nums">{option.amount.toLocaleString()}</span>
                            <span className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{option.label}</span>
                            <span className="mt-4 w-full border-t border-white/[0.06] pt-3 font-display text-lg font-bold text-gold">{option.price}</span>

                            <AnimatePresence>
                                {loading === option.amount && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 grid place-items-center bg-ink/80"
                                    >
                                        <Loader2 className="size-6 animate-spin text-gold" strokeWidth={1.5} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                    All purchases are final. Coins are added directly to your balance.
                </p>
            </DialogContent>
        </Dialog>
    );
}
