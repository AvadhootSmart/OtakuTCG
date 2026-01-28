"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu, Zap, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const modes = [
  {
    title: "Faction Builder",
    description:
      "Construct and refine your deck. Test new strategies against the AI and optimize your Faction's synergy.",
    icon: Cpu,
    color: "from-cyan-500 to-blue-600",
    delay: 0.2,
    href: "/play/faction-builder",
  },
  {
    title: "Dispatch",
    description:
      "Send your units on automated missions to gather resources and experience while you're away.",
    icon: Zap,
    color: "from-red-500 to-yellow-600",
    delay: 0.3,
    href: "/play/dispatch",
  },
];

interface GameModeDialogProps {
  children: React.ReactNode;
}

export function GameModeDialog({ children }: GameModeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-black/95 border-white/10 backdrop-blur-2xl p-0 overflow-hidden outline-none max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase">
                Mission Control
              </span>
            </div>
            <DialogTitle className="text-4xl md:text-5xl font-bold text-center rock-salt text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] leading-[2]">
              CHOOSE YOUR BATTLE
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: mode.delay }}
                className="relative group"
              >
                <div className="relative h-full flex flex-col p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 group-hover:border-white/20 transition-all duration-500">
                  <div
                    className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${mode.color} shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}
                  >
                    <mode.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tighter italic">
                    {mode.title.toUpperCase()}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-grow">
                    {mode.description}
                  </p>

                  <Link href={mode.href} className="mt-auto">
                    <button
                      className={`w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 group-hover:border-white/20 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2`}
                    >
                      <span>Play</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
