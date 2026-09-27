"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    animate,
    motion,
    AnimatePresence,
    MotionConfig,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";
import { ChevronsRight, X } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
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

type Phase = "enter" | "ready" | "charging" | "burst" | "emerge" | "flip" | "revealed";
type Rarity = ICard["rarity"];

const EASE = [0.32, 0.72, 0, 1] as const;
const SEAM = 13; // % from the top of the pack where it tears

// Higher rarities get a longer charge, more suspense and a bigger explosion.
const TIER: Record<Rarity, { charge: number; suspense: number; shake: number; rings: number; sparks: number; pips: number }> = {
    common: { charge: 450, suspense: 450, shake: 1.5, rings: 1, sparks: 10, pips: 1 },
    rare: { charge: 750, suspense: 650, shake: 2.5, rings: 1, sparks: 18, pips: 2 },
    epic: { charge: 1100, suspense: 850, shake: 4, rings: 2, sparks: 26, pips: 3 },
    legendary: { charge: 1600, suspense: 1200, shake: 7, rings: 3, sparks: 40, pips: 4 },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function PackOpeningOverlay({ isOpen, onClose, pack }: PackOpeningOverlayProps) {
    const [phase, setPhase] = useState<Phase>("enter");
    const [card, setCard] = useState<ICard | null>(null);
    const [left, setLeft] = useState<number | null>(null);
    const run = useRef(0); // bumps on every reset so stale sequences stop

    const tear = useMotionValue(0);
    const tearHead = useTransform(tear, (v) => `${v * 100}%`);
    const drag = useRef<{ x: number; w: number } | null>(null);

    // Pointer-driven parallax tilt for the pack and the card.
    const tiltX = useSpring(0, { stiffness: 120, damping: 18 });
    const tiltY = useSpring(0, { stiffness: 120, damping: 18 });

    const reset = () => {
        const id = ++run.current;
        setPhase("enter");
        setCard(null);
        tear.set(0);
        setTimeout(() => run.current === id && setPhase("ready"), 900);
    };

    useEffect(() => {
        if (isOpen) reset();
        else run.current++;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const startSequence = async () => {
        if (!pack || phase !== "ready") return;
        const id = ++run.current;
        const alive = () => run.current === id;
        setPhase("charging");
        try {
            const res = await openPack(pack._id);
            if (!alive()) return;
            const pulled: ICard = res.card;
            const entry = (res.remainingPacks as { packId: string | { _id: string }; count: number }[] | undefined)?.find(
                (p) => (typeof p.packId === "string" ? p.packId : p.packId?._id) === pack._id,
            );
            setCard(pulled);
            setLeft(entry?.count ?? 0);

            const tier = TIER[pulled.rarity] ?? TIER.common;
            await sleep(tier.charge);
            if (!alive()) return;
            setPhase("burst");
            await sleep(750);
            if (!alive()) return;
            setPhase("emerge");
            await sleep(700 + tier.suspense);
            if (!alive()) return;
            setPhase("flip");
        } catch (error) {
            toast.error(isAxiosError(error) ? error.response?.data?.error ?? "Failed to open pack" : "Failed to open pack");
            onClose();
        }
    };

    const finishTear = () => animate(tear, 1, { duration: 0.35, ease: EASE }).then(startSequence);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (phase !== "ready") return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, w: e.currentTarget.offsetWidth };
    };
    const onPointerMoveTear = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        const v = Math.min(1, Math.max(0, (e.clientX - drag.current.x) / (drag.current.w * 0.75)));
        tear.set(v);
        if (v >= 1) {
            drag.current = null;
            startSequence();
        }
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        const moved = Math.abs(e.clientX - drag.current.x);
        drag.current = null;
        // A tap tears it for you; an abandoned swipe springs back.
        if (moved < 6) finishTear();
        else animate(tear, 0, { type: "spring", stiffness: 300, damping: 25 });
    };

    if (!isOpen || !pack) return null;

    const accent = PACK_ACCENT[pack.accentColor] ?? PACK_ACCENT.slate;
    const color = card ? RARITY_COLOR[card.rarity] : accent;
    const tier = card ? TIER[card.rarity] ?? TIER.common : TIER.common;
    const packVisible = phase === "enter" || phase === "ready" || phase === "charging" || phase === "burst";
    const charged = phase === "charging" && !!card;
    const glowSize = phase === "revealed" ? 55 : charged ? 50 : 40;

    return (
        <MotionConfig reducedMotion="user">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onPointerMove={(e) => {
                    tiltY.set((e.clientX / window.innerWidth - 0.5) * 18);
                    tiltX.set(-(e.clientY / window.innerHeight - 0.5) * 12);
                }}
                className="fixed inset-0 z-40 grid touch-none select-none place-items-center overflow-hidden bg-[#040406]/95 backdrop-blur-xl"
            >
                {/* Ambient light, tinted by the pack, then by the pull */}
                <motion.div
                    className="pointer-events-none absolute inset-0"
                    animate={{
                        background: `radial-gradient(${glowSize}% ${glowSize}% at 50% 50%, ${color}${charged || phase === "revealed" ? "33" : "1f"}, transparent 70%)`,
                    }}
                    transition={{ duration: 0.8 }}
                />
                <Embers color={color} />

                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-5 top-5 z-30 grid size-10 place-items-center text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                    <X className="size-5" strokeWidth={1.5} />
                </button>

                {/* Stage */}
                <motion.div
                    className="relative flex flex-col items-center [perspective:1200px]"
                    animate={
                        charged
                            ? { x: [0, -tier.shake, tier.shake, -tier.shake, tier.shake, 0], y: 0 }
                            : phase === "burst"
                                ? { x: [0, -tier.shake * 3, tier.shake * 3, -tier.shake * 2, tier.shake, 0], y: [0, tier.shake * 2, -tier.shake * 2, tier.shake, 0] }
                                : { x: 0, y: 0 }
                    }
                    transition={charged ? { duration: 0.18, repeat: Infinity } : { duration: 0.5 }}
                >
                    <motion.div
                        style={{ rotateX: tiltX, rotateY: tiltY }}
                        className="relative grid h-[416px] w-[288px] place-items-center [transform-style:preserve-3d] [@media(max-height:760px)]:[zoom:0.78]"
                    >
                        {/* Sealed pack, split at the seam so it can tear */}
                        {packVisible && (
                            <motion.div
                                initial={{ y: -520, rotate: -10, opacity: 0 }}
                                animate={{ y: 0, rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                                className="absolute w-60"
                            >
                                <motion.div
                                    animate={phase === "ready" ? { y: [0, -8, 0] } : { y: 0 }}
                                    transition={phase === "ready" ? { repeat: Infinity, duration: 3.2, ease: "easeInOut" } : { duration: 0.3 }}
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Open ${pack.name}`}
                                        onPointerDown={onPointerDown}
                                        onPointerMove={onPointerMoveTear}
                                        onPointerUp={onPointerUp}
                                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && phase === "ready" && finishTear()}
                                        className={`relative aspect-[5/7.4] w-full outline-none ${phase === "ready" ? "cursor-grab active:cursor-grabbing" : ""}`}
                                    >
                                        {/* Body */}
                                        <motion.div
                                            inert
                                            className="absolute inset-0"
                                            style={{ clipPath: `inset(${SEAM}% 0 0 0)` }}
                                            animate={phase === "burst" ? { y: 460, rotate: 4, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.9, ease: [0.55, 0, 1, 0.45], delay: 0.12 }}
                                        >
                                            <CardPack pack={pack} selected />
                                        </motion.div>
                                        {/* Top strip */}
                                        <motion.div
                                            inert
                                            className="absolute inset-0 origin-[85%_10%]"
                                            style={{ clipPath: `inset(0 0 ${100 - SEAM}% 0)` }}
                                            animate={phase === "burst" ? { y: -300, x: 160, rotate: 38, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.8, ease: EASE }}
                                        >
                                            <CardPack pack={pack} selected />
                                        </motion.div>

                                        {/* Tear seam: dashed guide + lit progress + spark head */}
                                        {(phase === "ready" || phase === "charging") && (
                                            <div className="pointer-events-none absolute inset-x-2" style={{ top: `calc(${SEAM}% - 1px)` }}>
                                                <div className="h-px w-full bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.35)_0_4px,transparent_4px_8px)]" />
                                                <motion.div
                                                    className="absolute left-0 top-0 h-[2px] w-full origin-left"
                                                    style={{ scaleX: tear, background: color, boxShadow: `0 0 10px 2px ${color}` }}
                                                />
                                                <motion.div
                                                    className="absolute -top-[5px] size-3 -translate-x-1/2 rounded-full bg-white"
                                                    style={{ left: tearHead, boxShadow: `0 0 16px 6px ${color}` }}
                                                />
                                            </div>
                                        )}

                                        {/* Light leaking through the torn seam while it charges */}
                                        {phase === "charging" && (
                                            <motion.div
                                                className="pointer-events-none absolute inset-x-0 origin-bottom blur-md"
                                                style={{ bottom: `${100 - SEAM}%`, height: 140, background: `linear-gradient(to top, ${color}, transparent)` }}
                                                initial={{ scaleY: 0, opacity: 0 }}
                                                animate={{ scaleY: card ? 1 : 0.35, opacity: card ? 1 : 0.6 }}
                                                transition={{ duration: card ? tier.charge / 1000 : 0.4, ease: EASE }}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Burst: light column, shockwaves, sparks */}
                        {phase === "burst" && (
                            <>
                                <motion.div
                                    className="pointer-events-none absolute bottom-1/2 left-1/2 -ml-[5.5rem] w-44 origin-bottom blur-xl"
                                    style={{ height: "80vh", background: `linear-gradient(to top, #fff, ${color} 25%, transparent)` }}
                                    initial={{ scaleY: 0, opacity: 1 }}
                                    animate={{ scaleY: 1, opacity: [1, 1, 0] }}
                                    transition={{ duration: 0.75, ease: EASE }}
                                />
                                <Shockwaves color={color} count={tier.rings} />
                                <Sparks color={color} count={tier.sparks} />
                            </>
                        )}

                        {/* Face-down card rising out of the light */}
                        {(phase === "emerge" || phase === "flip") && card && (
                            <motion.div
                                className="absolute"
                                initial={{ y: 180, scale: 0.6, opacity: 0 }}
                                animate={
                                    phase === "flip"
                                        ? { y: 0, scale: 1.04, opacity: 1, rotateY: 90 }
                                        : { y: 0, scale: 1, opacity: 1, rotateY: [0, -6, 6, 0] }
                                }
                                transition={
                                    phase === "flip"
                                        ? { duration: 0.22, ease: [0.55, 0, 1, 0.45] }
                                        : { duration: 1, ease: EASE, rotateY: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
                                }
                                onAnimationComplete={() => phase === "flip" && setPhase("revealed")}
                                style={{ filter: `drop-shadow(0 0 ${20 + tier.pips * 10}px ${color})` }}
                            >
                                <CardBack color={color} />
                            </motion.div>
                        )}

                        {/* Reveal */}
                        {phase === "revealed" && card && (
                            <>
                                <Rays color={color} />
                                {tier.pips >= 3 && <Shockwaves color={color} count={1} />}
                                {tier.pips >= 2 && <Sparks color={color} count={Math.round(tier.sparks / 2)} />}
                                <motion.div
                                    className="absolute"
                                    initial={{ rotateY: -90, scale: 1.04 }}
                                    animate={{ rotateY: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 140, damping: 14 }}
                                    style={{ filter: `drop-shadow(0 0 40px ${color}66)` }}
                                >
                                    <TradingCard {...card} />
                                    <Glint />
                                </motion.div>
                            </>
                        )}
                    </motion.div>

                    {/* Caption under the stage */}
                    <div className="relative z-10 mt-8 flex h-28 flex-col items-center text-center [@media(max-height:760px)]:mt-4">
                        <AnimatePresence mode="wait">
                            {phase === "revealed" && card ? (
                                <motion.div
                                    key="reveal"
                                    className="flex flex-col items-center"
                                    initial="hidden"
                                    animate="show"
                                    variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}
                                >
                                    <motion.div variants={RISE} className="flex items-center gap-2">
                                        <Pips n={tier.pips} color={color} />
                                        <span className="eyebrow" style={{ color }}>{card.rarity}</span>
                                        <Pips n={tier.pips} color={color} />
                                    </motion.div>
                                    <motion.h2 variants={RISE} className="font-display text-4xl font-extrabold uppercase italic leading-none md:text-5xl">
                                        {card.name}
                                    </motion.h2>
                                    <motion.div variants={RISE} className="mt-4 flex gap-2">
                                        {left ? (
                                            <button onClick={reset} className="btn btn-ghost h-11 px-5 text-sm">
                                                Open another · {left}
                                            </button>
                                        ) : null}
                                        <button onClick={onClose} className="btn btn-gold h-11 px-6 text-sm">
                                            Add to collection
                                        </button>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={phase === "ready" ? "ready" : "wait"}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: phase === "burst" || phase === "emerge" || phase === "flip" ? 0 : 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.4, ease: EASE }}
                                >
                                    <div className="eyebrow" style={{ color: accent }}>{pack.name}</div>
                                    <div className="mt-2 flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-[0.12em]">
                                        {phase === "charging" ? (
                                            "Tearing open…"
                                        ) : phase === "ready" ? (
                                            <>
                                                Swipe the seal
                                                <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                                                    <ChevronsRight className="size-6 text-gold" strokeWidth={1.5} />
                                                </motion.span>
                                            </>
                                        ) : (
                                            "Sealed"
                                        )}
                                    </div>
                                    {phase === "ready" && <div className="mt-1 text-xs text-muted-foreground">or tap the pack</div>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Full-screen flash on burst */}
                <AnimatePresence>
                    {phase === "burst" && (
                        <motion.div
                            key="flash"
                            className="pointer-events-none fixed inset-0 z-20"
                            style={{ background: `radial-gradient(circle at 50% 45%, #fff, ${color} 35%, transparent 75%)` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.9, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, times: [0, 0.15, 1] }}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </MotionConfig>
    );
}

const RISE = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

function Pips({ n, color }: { n: number; color: string }) {
    return (
        <>
            {Array.from({ length: n }).map((_, i) => (
                <span key={i} className="size-1.5 rotate-45" style={{ background: color }} />
            ))}
        </>
    );
}

/** The face-down side of a card: same silhouette as TradingCard, gold frame, sigil. */
function CardBack({ color }: { color: string }) {
    return (
        <div className="chamfer [--c:14px] h-[416px] w-[288px] bg-[image:var(--metal-gold)] p-[10px]">
            <div className="chamfer [--c:10px] relative grid size-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#1c1c24,#08080b_70%)]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_6px)]" />
                <div className="absolute inset-3 border border-gold/25" />
                <svg viewBox="0 0 200 200" className="relative w-44 animate-[spin_24s_linear_infinite] text-gold">
                    <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeOpacity="0.5" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 6" />
                    <rect x="45" y="45" width="110" height="110" fill="none" stroke="currentColor" strokeOpacity="0.4" transform="rotate(45 100 100)" />
                    <rect x="58" y="58" width="84" height="84" fill="none" stroke="currentColor" strokeOpacity="0.25" />
                </svg>
                <span className="absolute font-display text-6xl font-extrabold italic text-metal">O</span>
                <div className="absolute inset-x-0 bottom-6 text-center font-display text-xs font-semibold uppercase tracking-[0.4em] text-gold/70">
                    Otaku TCG
                </div>
                <div className="absolute inset-0 mix-blend-screen" style={{ background: `radial-gradient(60% 50% at 50% 50%, ${color}40, transparent 70%)` }} />
            </div>
        </div>
    );
}

/** One sweep of light across the freshly revealed card. */
function Glint() {
    return (
        <div className="chamfer [--c:14px] pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
                className="absolute inset-y-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.45),transparent)]"
                initial={{ x: "-120%" }}
                animate={{ x: "320%" }}
                transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
            />
        </div>
    );
}

function Rays({ color }: { color: string }) {
    return (
        <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 1.2, ease: EASE }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
            className="pointer-events-none absolute left-1/2 top-1/2 -ml-[500px] -mt-[500px] size-[1000px] rounded-full"
            style={{
                background: `repeating-conic-gradient(from 0deg, ${color}24 0deg 5deg, transparent 5deg 15deg)`,
                maskImage: "radial-gradient(circle, #000 12%, transparent 60%)",
            }}
        />
    );
}

function Shockwaves({ color, count }: { color: string; count: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="pointer-events-none absolute left-1/2 top-1/2 -ml-24 -mt-24 size-48 rounded-full"
                    style={{ border: `2px solid ${color}`, boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}` }}
                    initial={{ scale: 0.2, opacity: 0.9 }}
                    animate={{ scale: 4.5, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.14, ease: EASE }}
                />
            ))}
        </>
    );
}

function Sparks({ color, count }: { color: string; count: number }) {
    const [sparks] = useState(() =>
        Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const dist = 160 + Math.random() * 260;
            return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 3 + Math.random() * 5, dur: 0.8 + Math.random() * 0.7 };
        }),
    );
    return (
        <>
            {sparks.map((s, i) => (
                <motion.span
                    key={i}
                    className="pointer-events-none absolute left-1/2 top-1/2"
                    style={{ width: s.size, height: s.size, background: i % 3 === 0 ? "#fff" : color, boxShadow: `0 0 8px ${color}` }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 45 }}
                    animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
                    transition={{ duration: s.dur, ease: [0.16, 1, 0.3, 1] }}
                />
            ))}
        </>
    );
}

/** Slow motes drifting upward in the background. */
function Embers({ color }: { color: string }) {
    const [motes] = useState(() =>
        Array.from({ length: 18 }, () => ({
            left: Math.random() * 100,
            size: 2 + Math.random() * 3,
            dur: 7 + Math.random() * 8,
            delay: Math.random() * -12,
            drift: (Math.random() - 0.5) * 80,
        })),
    );
    return (
        <div className="pointer-events-none absolute inset-0">
            {motes.map((m, i) => (
                <motion.span
                    key={i}
                    className="absolute bottom-0 rounded-full"
                    style={{ left: `${m.left}%`, width: m.size, height: m.size, background: color, boxShadow: `0 0 6px ${color}` }}
                    animate={{ y: [0, "-105vh"], x: [0, m.drift], opacity: [0, 0.8, 0] }}
                    transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "linear" }}
                />
            ))}
        </div>
    );
}
