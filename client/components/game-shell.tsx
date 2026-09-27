"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Coins, Layers, LogOut, Plus, Store, Swords, Castle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { AuthDialog } from "@/components/auth-dialog";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";
import { GameModeDialog } from "@/components/game-mode-dialog";
import { cn } from "@/lib/utils";

export const RARITY_ORDER = { legendary: 4, epic: 3, rare: 2, common: 1 } as const;
export const RARITY_COLOR = {
  common: "#d4d4d8",
  rare: "#60a5fa",
  epic: "#c084fc",
  legendary: "#f5c451",
} as const;
export const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#4ade80",
  Medium: "#f5c451",
  Hard: "#fb923c",
  Expert: "#f05a4f",
};
export const PACK_ACCENT: Record<string, string> = {
  blue: "#60a5fa",
  purple: "#c084fc",
  amber: "#f5c451",
  slate: "#a1a1aa",
};

const NAV = [
  { href: "/", label: "Lobby", icon: Castle, match: (p: string) => p === "/" },
  { href: "/profile", label: "Collection", icon: Layers, match: (p: string) => p.startsWith("/profile") },
  { href: "/marketplace", label: "Store", icon: Store, match: (p: string) => p.startsWith("/marketplace") },
  { href: "/showcase", label: "Codex", icon: BookOpen, match: (p: string) => p.startsWith("/showcase") },
];

function NavTab({ active, icon: Icon, label }: { active: boolean; icon: typeof Castle; label: string }) {
  return (
    <span
      className={cn(
        "group relative flex h-16 items-center gap-2 px-3 md:px-4 font-display text-[15px] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 ease-snap",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("size-[18px] transition-colors duration-500", active && "text-gold")} strokeWidth={1.5} />
      <span className="hidden md:inline">{label}</span>
      <span
        className={cn(
          "absolute inset-x-3 bottom-0 h-[2px] origin-center bg-gold shadow-[0_0_12px_2px_rgba(245,196,81,0.45)] transition-transform duration-500 ease-snap",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
        )}
      />
    </span>
  );
}

function TopBar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { profile, fetchProfile, setProfile } = useUserStore();
  const userId = session?.user.id;

  useEffect(() => {
    if (userId) fetchProfile();
    else setProfile(null);
  }, [userId, fetchProfile, setProfile]);

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#08080c]/85 px-3 md:px-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <Link href="/" className="flex shrink-0 items-center gap-3 pr-2 md:pr-6">
        <span className="chamfer [--c:6px] grid size-9 place-items-center bg-[image:var(--metal-gold)]">
          <span className="chamfer [--c:5px] grid size-[34px] place-items-center bg-ink font-display text-lg font-extrabold italic text-gold">
            O
          </span>
        </span>
        <span className="hidden font-display text-xl font-extrabold italic uppercase tracking-wide sm:block">
          Otaku<span className="text-metal">TCG</span>
        </span>
      </Link>

      <nav className="flex min-w-0 items-center">
        {NAV.slice(0, 1).map((n) => (
          <Link key={n.href} href={n.href}>
            <NavTab active={n.match(pathname)} icon={n.icon} label={n.label} />
          </Link>
        ))}
        <GameModeDialog>
          <button type="button">
            <NavTab active={pathname.startsWith("/play")} icon={Swords} label="Play" />
          </button>
        </GameModeDialog>
        {NAV.slice(1).map((n) => (
          <Link key={n.href} href={n.href}>
            <NavTab active={n.match(pathname)} icon={n.icon} label={n.label} />
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
        {session ? (
          <>
            <BuyCoinsDialog>
              <button type="button" className="plate [--c:7px] group flex h-9 items-center gap-2 pl-3 pr-1">
                <Coins className="size-4 text-gold" strokeWidth={1.5} />
                <span className="font-display text-lg font-bold tabular-nums">{profile?.balance ?? "—"}</span>
                <span className="chamfer [--c:5px] grid size-7 place-items-center bg-gold/15 text-gold transition-transform duration-500 ease-snap group-hover:scale-105">
                  <Plus className="size-3.5" strokeWidth={2} />
                </span>
              </button>
            </BuyCoinsDialog>
            <Link href="/profile" className="hidden items-center gap-2.5 sm:flex">
              <span className="chamfer [--c:6px] grid size-9 place-items-center bg-white/10">
                <span className="chamfer [--c:5px] grid size-[34px] place-items-center bg-[#15151c] font-display text-base font-bold uppercase">
                  {session.user.name?.[0]}
                </span>
              </span>
              <span className="hidden flex-col leading-none lg:flex">
                <span className="max-w-32 truncate text-sm font-medium">{session.user.name}</span>
                <span className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Lv {profile?.level ?? 1}
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => authClient.signOut()}
              aria-label="Sign out"
              className="hidden size-9 place-items-center text-muted-foreground transition-colors duration-300 hover:text-destructive sm:grid"
            >
              <LogOut className="size-[18px]" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <AuthDialog>
            <button type="button" className="btn btn-gold h-9 px-4 text-sm">
              Sign in
            </button>
          </AuthDialog>
        )}
      </div>
    </header>
  );
}

/** Full-viewport game frame: HUD bar on top, the screen fills the rest. Never scrolls. */
export function GameShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />
      <main className={cn("relative min-h-0 flex-1", className)}>{children}</main>
    </div>
  );
}

/** Eyebrow + big condensed title + optional right-side slot. */
export function ScreenHeader({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0">
        <div className="eyebrow mb-1.5">{eyebrow}</div>
        <h1 className="font-display text-4xl font-extrabold uppercase italic leading-[0.9] tracking-tight md:text-5xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

/** Centered message for empty/loading/error states. */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-5 h-px w-16 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="font-display text-2xl font-bold uppercase tracking-wide">{title}</div>
        {body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
