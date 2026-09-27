"use client";

import { useId } from "react";
import Image from "next/image";
import { Barlow_Condensed } from "next/font/google";
import { Crown, Flame, Gem, Hexagon } from "lucide-react";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"] });

export interface CardAttributes {
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
}

export interface TradingCardProps {
    _id: string;
    name?: string;
    overall?: number;
    attributes?: CardAttributes;
    imageUrl?: string;
    rarity?: "common" | "rare" | "epic" | "legendary";
    health?: number;
}

const FALLBACK_IMAGE = "https://framerusercontent.com/images/wPUUFSxql4UyBvz6Yxj3iju3X0.jpeg?width=2400&height=1440";

// ---- Geometry (px; the card is always rendered at 288x416) ----
type Pt = [number, number];
const W = 288, H = 416;
const K = 14;   // outer corner chamfer
const F = 10;   // metal frame thickness
const T = 78;   // OVR tile size
const C = 46;   // OVR tile diagonal cut
const G = 6;    // gap between tile and panel
const ART_H = 292;
const k = K - F * (Math.SQRT2 - 1); // chamfer of the frame's inner edge
const g = G * Math.SQRT2 - G;       // extra shift so the diagonal gap is also exactly G wide

const PLATE: Pt[] = [[K, 0], [W - K, 0], [W, K], [W, H - K], [W - K, H], [K, H], [0, H - K], [0, K]];
const TILE: Pt[] = [[W - F - T, F], [W - F - k, F], [W - F, F + k], [W - F, F + T], [W - F - T + C, F + T], [W - F - T, F + T - C]];
const NOTCH: Pt[] = [[W - F - T - G, F], [W - F - T - G, F + T - C + g], [W - F - T + C - g, F + T + G], [W - F, F + T + G]];
const PANEL: Pt[] = [[F, F + k], [F + k, F], ...NOTCH, [W - F, H - F - k], [W - F - k, H - F], [F + k, H - F], [F, H - F - k]];
const ART: Pt[] = [[F, F + k], [F + k, F], ...NOTCH, [W - F, ART_H], [F, ART_H]];

// Offsets a clockwise polygon inward by d (miter joins), for the hairline rules.
function inset(pts: Pt[], d: number): Pt[] {
    const normal = (a: Pt, b: Pt): Pt => {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    };
    return pts.map((p, i) => {
        const n1 = normal(pts[(i - 1 + pts.length) % pts.length], p);
        const n2 = normal(p, pts[(i + 1) % pts.length]);
        const s = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
        return [p[0] + (n1[0] + n2[0]) * s, p[1] + (n1[1] + n2[1]) * s];
    });
}
const svgPts = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
const cssPoly = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(", ")})`;

// Rarity plate at the bottom: an elongated hexagon.
const PLATE_Y = 374, PLATE_W = 124, PLATE_H = 20, PX = (W - PLATE_W) / 2;
const RARITY_PLATE: Pt[] = [[PX + 9, PLATE_Y], [PX + PLATE_W - 9, PLATE_Y], [PX + PLATE_W, PLATE_Y + PLATE_H / 2], [PX + PLATE_W - 9, PLATE_Y + PLATE_H], [PX + 9, PLATE_Y + PLATE_H], [PX, PLATE_Y + PLATE_H / 2]];

// metal: gradient stops for frame/text, accent: glow + icon color, tier: pip count
const rarityStyles = {
    common: { metal: ["#3a3d44", "#c9ccd3", "#6f737c", "#e8eaee", "#484b52"], accent: "#d4d4d8", tier: 1, Icon: Hexagon },
    rare: { metal: ["#0b2447", "#8cc4f5", "#255da3", "#cfe6ff", "#10355f"], accent: "#60a5fa", tier: 2, Icon: Gem },
    epic: { metal: ["#2e0f57", "#c79bf5", "#6b2fb3", "#e6c8ff", "#3d1570"], accent: "#c084fc", tier: 3, Icon: Flame },
    legendary: { metal: ["#7a4e0e", "#f3d27a", "#b07a1f", "#ffe9a8", "#8a5a12"], accent: "#f5c451", tier: 4, Icon: Crown },
};
const STOP_AT = [0, 0.28, 0.5, 0.72, 1];

export function TradingCard({
    _id,
    name = "Eren Yeager",
    overall = 87,
    attributes = {
        attack: 85,
        defense: 72,
        speed: 78,
        intelligence: 82
    },
    imageUrl = FALLBACK_IMAGE,
    rarity = "legendary",
    health = 100,
}: TradingCardProps) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const id = (s: string) => `${s}-${uid}`;
    const style = rarityStyles[rarity];
    const metalCss = `linear-gradient(135deg, ${style.metal.map((c, i) => `${c} ${STOP_AT[i] * 100}%`).join(", ")})`;
    const metalText = { backgroundImage: metalCss, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
    // Each card gets its own foil crinkle pattern, derived from its id.
    const seed = [..._id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7);

    const stats = [
        { label: "ATK", val: attributes.attack },
        { label: "DEF", val: attributes.defense },
        { label: "INT", val: attributes.intelligence },
        { label: "SPD", val: attributes.speed },
        { label: "HP", val: health },
        { label: "ENG", val: 100 },
    ];

    return (
        <div
            className={`${display.className} relative w-72 h-104 select-none`}
            style={{ filter: `drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 14px ${style.accent}26)` }}
        >
            {/* Back layer: metal plate, foil texture, bevel, dark panel */}
            <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
                <defs>
                    <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="1">
                        {style.metal.map((c, i) => <stop key={i} offset={STOP_AT[i]} stopColor={c} />)}
                    </linearGradient>
                    <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0.6">
                        <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
                        <stop offset="0.45" stopColor="#fff" stopOpacity="0.2" />
                        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#15151a" />
                        <stop offset="1" stopColor="#08080a" />
                    </linearGradient>
                    <filter id={id("foil")} x="0" y="0" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed={seed} result="noise" />
                        <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2.2">
                            <feDistantLight azimuth="225" elevation="50" />
                        </feDiffuseLighting>
                    </filter>
                    <pattern id={id("hatch")} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="5" stroke="#fff" strokeOpacity="0.035" />
                    </pattern>
                    <clipPath id={id("plateClip")}><polygon points={svgPts(PLATE)} /></clipPath>
                </defs>

                <polygon points={svgPts(PLATE)} fill={`url(#${id("metal")})`} />
                <g clipPath={`url(#${id("plateClip")})`}>
                    <rect width={W} height={H} filter={`url(#${id("foil")})`} opacity="0.55" style={{ mixBlendMode: "multiply" }} />
                    <rect width={W} height={H} fill={`url(#${id("sheen")})`} style={{ mixBlendMode: "screen" }} />
                </g>
                <polygon points={svgPts(PLATE)} fill="none" stroke="#000" strokeOpacity="0.45" />
                <polygon points={svgPts(inset(PLATE, 1.5))} fill="none" stroke="#fff" strokeOpacity="0.35" />

                <polygon points={svgPts(PANEL)} fill={`url(#${id("panel")})`} />
                <polygon points={svgPts(PANEL)} fill={`url(#${id("hatch")})`} />
                <polygon points={svgPts(TILE)} fill={`url(#${id("panel")})`} />
            </svg>

            {/* Art window */}
            <div className="absolute inset-0" style={{ clipPath: cssPoly(ART) }}>
                <div className="absolute inset-x-0 top-0" style={{ height: ART_H }}>
                    <Image src={imageUrl || FALLBACK_IMAGE} alt={name} fill sizes="288px" className="object-cover object-top" />
                    <div className="absolute inset-0" style={{ background: `radial-gradient(120% 60% at 50% 100%, ${style.accent}33, transparent 60%)`, mixBlendMode: "screen" }} />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),transparent_22%,transparent_50%,#0b0b0e_97%)]" />
                </div>
            </div>

            {/* Front layer: engraved edges, hairline rules, dividers, rarity plate */}
            <svg className="absolute inset-0 pointer-events-none" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
                <defs>
                    <linearGradient id={id("metalF")} x1="0" y1="0" x2="1" y2="1">
                        {style.metal.map((c, i) => <stop key={i} offset={STOP_AT[i]} stopColor={c} />)}
                    </linearGradient>
                    <linearGradient id={id("fade")} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor={style.metal[1]} stopOpacity="0" />
                        <stop offset="0.5" stopColor={style.metal[1]} stopOpacity="0.8" />
                        <stop offset="1" stopColor={style.metal[1]} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={id("vfade")} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={style.metal[1]} stopOpacity="0" />
                        <stop offset="0.5" stopColor={style.metal[1]} stopOpacity="0.35" />
                        <stop offset="1" stopColor={style.metal[1]} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {[PANEL, TILE].map((poly, i) => (
                    <g key={i}>
                        <polygon points={svgPts(poly)} fill="none" stroke="#000" strokeOpacity="0.7" strokeWidth="1.5" />
                        <polygon points={svgPts(inset(poly, 4))} fill="none" stroke={`url(#${id("metalF")})`} strokeWidth="0.8" strokeOpacity="0.75" />
                    </g>
                ))}

                {/* Divider with center diamond */}
                <line x1="24" y1="270" x2={W - 24} y2="270" stroke={`url(#${id("fade")})`} />
                <rect x={W / 2 - 3} y="267" width="6" height="6" transform={`rotate(45 ${W / 2} 270)`} fill={`url(#${id("metalF")})`} />

                {/* Stat column separators */}
                {[W / 2 - 40, W / 2 + 40].map((x) => (
                    <line key={x} x1={x} y1="280" x2={x} y2="358" stroke={`url(#${id("vfade")})`} />
                ))}

                {/* Rarity plate, flanking rules and tier pips */}
                <line x1="24" y1={PLATE_Y + PLATE_H / 2} x2={PX - 6} y2={PLATE_Y + PLATE_H / 2} stroke={`url(#${id("fade")})`} />
                <line x1={PX + PLATE_W + 6} y1={PLATE_Y + PLATE_H / 2} x2={W - 24} y2={PLATE_Y + PLATE_H / 2} stroke={`url(#${id("fade")})`} />
                <polygon points={svgPts(RARITY_PLATE)} fill="#0b0b0e" stroke={`url(#${id("metalF")})`} />
                <polygon points={svgPts(inset(RARITY_PLATE, 2.5))} fill="none" stroke={style.metal[1]} strokeOpacity="0.25" strokeWidth="0.6" />
                {Array.from({ length: style.tier }).flatMap((_, i) =>
                    [PX - 14 - i * 9, PX + PLATE_W + 14 + i * 9].map((cx) => (
                        <rect key={`${i}-${cx}`} x={cx - 2} y={PLATE_Y + PLATE_H / 2 - 2} width="4" height="4" transform={`rotate(45 ${cx} ${PLATE_Y + PLATE_H / 2})`} fill={`url(#${id("metalF")})`} />
                    ))
                )}
            </svg>

            {/* OVR */}
            <div className="absolute flex flex-col items-center" style={{ left: W - F - 52, top: F + 8, width: 46 }}>
                <span className="text-[36px] font-extrabold leading-none tabular-nums" style={metalText}>{overall}</span>
                <span className="text-[8px] font-semibold tracking-[0.35em] text-white/60 pl-[0.35em]">OVR</span>
            </div>

            {/* Name and medallion */}
            <div className="absolute flex items-center justify-between gap-3" style={{ left: 22, right: 22, top: 226 }}>
                <div className="min-w-0">
                    <h3 className="text-[24px] font-bold uppercase leading-none tracking-[0.04em] text-white truncate [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
                        {name}
                    </h3>
                </div>
                <div className="shrink-0 size-9 rounded-full p-[1.5px] shadow-[0_2px_8px_rgba(0,0,0,0.6)]" style={{ background: metalCss }}>
                    <div className="size-full rounded-full grid place-items-center bg-[radial-gradient(circle_at_35%_30%,#26262c,#0a0a0c)]">
                        <style.Icon className="size-4" strokeWidth={1.75} style={{ color: style.accent }} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="absolute grid grid-cols-3 gap-y-2.5" style={{ left: W / 2 - 120, width: 240, top: 280 }}>
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center">
                        <span className="text-[9px] font-semibold leading-none tracking-[0.3em] pl-[0.3em]" style={{ color: `${style.metal[1]}b3` }}>{stat.label}</span>
                        <span className="mt-1 text-[21px] font-bold leading-none tabular-nums text-white">{stat.val}</span>
                    </div>
                ))}
            </div>

            {/* Rarity label */}
            <div className="absolute grid place-items-center" style={{ left: PX, width: PLATE_W, top: PLATE_Y, height: PLATE_H }}>
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] pl-[0.35em]" style={metalText}>{rarity}</span>
            </div>
        </div>
    );
}
