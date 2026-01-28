"use client";

import { useState, useEffect } from "react";
import { Play, Package, Sparkles, LogIn, UserPlus, LogOut, List, Coins, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { AuthDialog } from "@/components/auth-dialog";
import { GameModeDialog } from "@/components/game-mode-dialog";

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  primary?: boolean;
  danger?: boolean;
  isAuth?: boolean;
  isGameMode?: boolean;
  onClick?: () => void;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    setMounted(true);
    if (session) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  if (!mounted) return null;

  const authenticatedMenuItems: MenuItem[] = [
    { icon: Play, label: "PLAY VS AI", isGameMode: true, primary: true },
    { icon: Package, label: "MARKETPLACE", href: "/marketplace" },
    { icon: LayoutGrid, label: "COLLECTION", href: "/profile" },
    { icon: List, label: "SHOWCASE", href: "/showcase" },
    { icon: LogOut, label: "LOGOUT", onClick: () => authClient.signOut(), danger: true },
  ];

  const guestMenuItems: MenuItem[] = [
    { icon: LogIn, label: "SIGN IN", isAuth: true, primary: true },
    { icon: Package, label: "MARKETPLACE", href: "/marketplace" },
    { icon: UserPlus, label: "CREATE ACCOUNT", isAuth: true },
    { icon: Sparkles, label: "VIEW CARDS", href: "/showcase" },
  ];

  const menuItems = session ? authenticatedMenuItems : guestMenuItems;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-[1] opacity-70"
        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 px-6">
        {/* Left Side: Game Title & Logo */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start space-y-4 max-w-xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>SEASON 1: AWAKENING</span>
          </div>

          <h1 className="text-6xl md:text-8xl rock-salt text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-400 leading-[1.5]  drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            OTAKU<br />TCG
          </h1>

          <p className="text-lg text-zinc-400 max-w-md border-l-2 border-blue-500/50 pl-4 py-2 italic font-light text-wrap">
            "In this world, every card tells a story, and every battle defines your destiny."
          </p>
        </motion.div>

        {/* Right Side: Vertical Menu */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <nav className="flex flex-col space-y-3">
            {menuItems.map((item, index) => {
              const content = (
                <motion.div
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.onClick}
                  className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${item.primary
                    ? "bg-gradient-to-r from-blue-600 to-blue-300 border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    : item.danger
                      ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 group"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 group"
                    }`}
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <item.icon className={`w-5 h-5 ${item.primary ? "text-white" : item.danger ? "text-red-400" : "text-white"}`} />
                    <span className={`text-lg font-bold tracking-tighter ${item.primary ? "text-white" : item.danger ? "text-red-200" : "text-zinc-200"}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Decorative Elements for Menu Item */}
                  <div className={`absolute right-[-20%] bottom-[-50%] w-32 h-32 rounded-full blur-2xl transition-transform group-hover:scale-150 ${item.danger ? "bg-red-500/10" : "bg-white/5"}`} />

                  {item.primary && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              );

              if (item.isAuth) {
                return <AuthDialog key={item.label}>{content}</AuthDialog>;
              }

              if (item.isGameMode) {
                return <GameModeDialog key={item.label}>{content}</GameModeDialog>;
              }

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                );
              }

              return <div key={item.label}>{content}</div>;
            })}
          </nav>

          {/* User Preview / Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/5 backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              {session && profile ? (
                <motion.div
                  key="user-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Player Identity</span>
                    <div className="flex items-center space-x-2 text-yellow-500">
                      <Coins className="w-3 h-3" />
                      <span className="text-xs font-bold">{profile.balance}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-white shadow-lg">
                      {session.user.name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold tracking-tight leading-none mb-1">{session.user.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">Level 1 Novice</div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="guest-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-tighter font-bold">Briefing</span>
                    <span className="text-[10px] text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded font-bold">TUTORIAL</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light italic">
                    "New to the arena? Sign in to claim your starter pack and begin your journey."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
