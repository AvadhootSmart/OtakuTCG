"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Lock, Radar, ShieldHalf, Skull } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const modes = [
  {
    title: "Faction Builder",
    tag: "Missions",
    description: "Draft a squad of five that satisfies each contract's criteria. Clear it for coins, packs and XP.",
    icon: ShieldHalf,
    accent: "#60a5fa",
    href: "/play/faction-builder",
  },
  {
    title: "Dispatch",
    tag: "Real-time",
    description: "Hold a city under siege. Route operatives to incidents on the map before the signal is lost.",
    icon: Radar,
    accent: "#f05a4f",
    href: "/play/dispatch",
  },
  {
    title: "Gauntlet",
    tag: "Coming soon",
    description: "Climb a ladder of escalating duels. One loss and the run is over.",
    icon: Skull,
    accent: "#c084fc",
    href: null,
  },
];

export function GameModeDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="text-left">
          <div className="eyebrow">Select mode</div>
          <DialogTitle className="text-4xl italic md:text-5xl">Choose your battle</DialogTitle>
          <DialogDescription>Your collection is your army. Pick where it fights.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {modes.map((mode, i) => {
            const tile = (
              <div className="plate [--c:14px] group flex h-full flex-col p-5 md:min-h-72">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 -z-[1] h-2/3 opacity-60 transition-opacity duration-700 ease-snap group-hover:opacity-100"
                  style={{ background: `radial-gradient(90% 70% at 0% 0%, ${mode.accent}30, transparent 70%)` }}
                />
                <div className="flex items-start justify-between">
                  <mode.icon className="size-9" strokeWidth={1.25} style={{ color: mode.accent }} />
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    {mode.tag}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-3xl font-extrabold uppercase italic leading-none">{mode.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
                <div className="mt-6 flex items-center justify-between font-display text-sm font-bold uppercase tracking-[0.18em]">
                  <span style={{ color: mode.href ? mode.accent : undefined }} className={mode.href ? "" : "text-muted-foreground"}>
                    {mode.href ? "Enter" : "Locked"}
                  </span>
                  <span className="chamfer [--c:5px] grid size-8 place-items-center bg-white/[0.06] transition-transform duration-500 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    {mode.href ? <ArrowUpRight className="size-4" strokeWidth={1.5} /> : <Lock className="size-3.5" strokeWidth={1.5} />}
                  </span>
                </div>
              </div>
            );
            return (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.32, 0.72, 0, 1] }}
                className={mode.href ? "" : "opacity-50"}
              >
                {mode.href ? (
                  <Link href={mode.href} className="block h-full">
                    {tile}
                  </Link>
                ) : (
                  tile
                )}
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
