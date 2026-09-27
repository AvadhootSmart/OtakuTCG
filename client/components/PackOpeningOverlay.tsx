"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TradingCard } from "./TradingCard";
import { CardPack } from "./CardPack";
import { PACK_ACCENT, RARITY_COLOR } from "./game-shell";
import { openPack } from "@/api/marketplace";
import { IPack } from "@/types/pack";
import { ICard } from "@/types/card";

interface PackOpeningOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    pack: IPack | null;
}

const EASE = [0.32, 0.72, 0, 1] as const;

export function PackOpeningOverlay({ isOpen, onClose, pack }: PackOpeningOverlayProps) {
    const [status, setStatus] = useState<"idle" | "shaking" | "opening" | "revealed">("idle");
    const [revealedCard, setRevealedCard] = useState<ICard | null>(null);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStatus("idle");
            setRevealedCard(null);
            const timer = setTimeout(() => setStatus("shaking"), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handlePackClick = async () => {
        if (status === "shaking" && pack && !isOpening) {
            setIsOpening(true);
            try {
                const res = await openPack(pack._id);
                setRevealedCard(res.card);
                setStatus("opening");
                setTimeout(() => setStatus("revealed"), 800);
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Failed to open pack");
                onClose();
            } finally {
                setIsOpening(false);
            }
        }
    };

    if (!isOpen || !pack) return null;

    const accent = PACK_ACCENT[pack.accentColor] ?? PACK_ACCENT.slate;
    const glow = revealedCard ? RARITY_COLOR[revealedCard.rarity] : accent;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-[#050507]/95 backdrop-blur-xl"
        >
            <div
                className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
                style={{ background: `radial-gradient(45% 45% at 50% 50%, ${glow}26, transparent 70%)` }}
            />

            <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-5 top-5 z-10 grid size-10 place-items-center text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
                <X className="size-5" strokeWidth={1.5} />
            </button>

            {status !== "revealed" && (
                <div className="flex flex-col items-center gap-8">
                    <motion.div
                        initial={{ scale: 0.85, y: 40, opacity: 0 }}
                        animate={{
                            scale: 1,
                            y: 0,
                            opacity: 1,
                            rotateZ: status === "shaking" ? (isOpening ? [0, -3, 3, -3, 3, 0] : [0, -1, 1, 0]) : 0,
                        }}
                        transition={{
                            rotateZ: { repeat: Infinity, duration: isOpening ? 0.25 : 1.6 },
                            default: { duration: 0.9, ease: EASE },
                        }}
                        className="w-56 [@media(min-height:720px)]:w-64"
                    >
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}>
                            <CardPack pack={pack} selected onClick={handlePackClick} />
                        </motion.div>
                    </motion.div>
                    <div className="text-center">
                        <div className="eyebrow" style={{ color: accent }}>{pack.name}</div>
                        <div className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.12em]">
                            {status === "idle" ? "Sealed" : isOpening ? "Tearing open…" : "Tap the pack to open"}
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {status === "opening" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-20 grid place-items-center bg-white"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 30 }}
                            transition={{ duration: 0.7, ease: "circIn" }}
                            className="size-16 rounded-full blur-3xl"
                            style={{ background: glow }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {status === "revealed" && revealedCard && (
                <div className="relative flex flex-col items-center">
                    {/* Light rays behind the card */}
                    <motion.div
                        aria-hidden
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1, rotate: 360 }}
                        transition={{ opacity: { duration: 1 }, scale: { duration: 1.2, ease: EASE }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
                        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                            background: `repeating-conic-gradient(from 0deg, ${glow}1f 0deg 6deg, transparent 6deg 18deg)`,
                            maskImage: "radial-gradient(circle, #000 10%, transparent 60%)",
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                        className="mb-6 text-center"
                    >
                        <div className="eyebrow" style={{ color: glow }}>New card · {revealedCard.rarity}</div>
                        <h2 className="mt-1 font-display text-5xl font-extrabold uppercase italic leading-none">{revealedCard.name}</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.8, rotateY: 90 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12 }}
                        className="[@media(max-height:760px)]:[zoom:0.78]"
                        style={{ filter: `drop-shadow(0 0 40px ${glow}55)` }}
                    >
                        <TradingCard {...revealedCard} />
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
                        onClick={onClose}
                        className="btn btn-gold mt-8 h-12 px-10 text-base"
                    >
                        Add to collection
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}
