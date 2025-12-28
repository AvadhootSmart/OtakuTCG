"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";
import { TradingCard } from "./TradingCard";
import { cards as allCards } from "../static_data/cards";
import { CardPack as PackType } from "../static_data/packs";

interface PackOpeningOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    pack: PackType | null;
}

export function PackOpeningOverlay({ isOpen, onClose, pack }: PackOpeningOverlayProps) {
    const [status, setStatus] = useState<"idle" | "shaking" | "opening" | "revealed">("idle");
    const [revealedCards, setRevealedCards] = useState(allCards.slice(0, 4)); // Mocking 4 cards for now

    useEffect(() => {
        if (isOpen) {
            setStatus("idle");
            // Auto start shaking after a small delay
            const timer = setTimeout(() => setStatus("shaking"), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handlePackClick = () => {
        if (status === "shaking") {
            setStatus("opening");
            // Artificial delay for the "opening" flash
            setTimeout(() => {
                setStatus("revealed");
            }, 800);
        }
    };

    if (!isOpen || !pack) return null;

    const packAccentStyles: Record<string, string> = {
        blue: "from-blue-500 to-cyan-400 border-blue-500/50 shadow-blue-500/40",
        purple: "from-purple-600 to-pink-500 border-purple-500/50 shadow-purple-500/40",
        amber: "from-amber-500 to-yellow-400 border-amber-500/50 shadow-amber-500/40",
    };

    const accentClass = packAccentStyles[pack.accentColor] || "";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-2xl"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors z-[110]"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative w-full h-full flex items-center justify-center p-8">

                    {/* The Pack Opening Sequence */}
                    {status !== "revealed" && (
                        <motion.div
                            layoutId={`pack-${pack.id}`}
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{
                                scale: 1,
                                y: 0,
                                opacity: 1,
                                rotateZ: status === "shaking" ? [0, -2, 2, -2, 2, 0] : 0,
                            }}
                            transition={{
                                rotateZ: {
                                    repeat: Infinity,
                                    duration: 0.2,
                                    ease: "easeInOut"
                                },
                                default: { duration: 0.5 }
                            }}
                            onClick={handlePackClick}
                            className={`relative w-72 h-[420px] rounded-2xl border-4 bg-card overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] cursor-pointer group ${accentClass}`}
                        >
                            {/* Pack Art */}
                            <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="mb-4"
                                >
                                    <Sparkles className="w-12 h-12 text-amber-400" />
                                </motion.div>
                                <h2 className="text-3xl font-black rock-salt mb-2">{pack.name}</h2>
                                <p className="text-sm font-bold uppercase tracking-tighter opacity-80">
                                    {status === "idle" ? "Ready to unleash?" : "Click to Rip Open!"}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Full Screen Opening Flash */}
                    <AnimatePresence>
                        {status === "opening" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 z-[120] bg-white flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 30 }}
                                    transition={{ duration: 0.7, ease: "circIn" }}
                                    className="w-16 h-16 bg-amber-400 rounded-full blur-3xl shadow-[0_0_100px_rgba(251,191,36,0.8)]"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Revealed Cards Grid */}
                    {status === "revealed" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-7xl"
                        >
                            <div className="text-center mb-12">
                                <motion.h2
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    className="text-5xl font-black rock-salt mb-2"
                                >
                                    Pack Results
                                </motion.h2>
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                                    You pulled {revealedCards.length} rare items!
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                                {revealedCards.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 30, scale: 0.8, rotateY: 90 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                                        transition={{
                                            delay: idx * 0.15,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 12
                                        }}
                                    >
                                        <TradingCard {...card} />
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-16 flex justify-center"
                            >
                                <button
                                    onClick={onClose}
                                    className="px-12 py-4 bg-foreground text-background font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter"
                                >
                                    Add to Collection
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
