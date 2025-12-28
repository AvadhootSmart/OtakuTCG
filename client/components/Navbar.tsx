"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOutIcon, Coins } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { AuthDialog } from "./auth-dialog";
import { authClient } from "@/lib/auth-client";
import { getProfile, IUserProfile } from "@/api/user";

export function Navbar() {
    const { data: session } = authClient.useSession();
    const [profile, setProfile] = useState<IUserProfile | null>(null);

    useEffect(() => {
        if (session) {
            getProfile().then(setProfile).catch(console.error);
        } else {
            setProfile(null);
        }
    }, [session]);

    return (
        <nav className="px-6 py-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-background" />
                    </div>
                    <span className="text-2xl rock-salt text-foreground">OtakuTCG</span>
                </Link>

                <div className="flex items-center space-x-8">
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/showcase"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Showcase
                        </Link>
                        <Link
                            href="/marketplace"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Marketplace
                        </Link>

                        {session ? (
                            <div className="flex items-center space-x-6">
                                {profile && (
                                    <div className="flex items-center px-3 py-1.5 bg-muted rounded-full border border-border">
                                        <Coins className="w-4 h-4 text-yellow-500 mr-2" />
                                        <span className="text-sm font-medium text-foreground">
                                            {profile.balance}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/profile"
                                        className="text-muted-foreground hover:text-foreground transition-colors font-medium border-l border-border pl-6"
                                    >
                                        {session.user.name}
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0 hover:text-destructive transition-colors"
                                        onClick={async () => {
                                            await authClient.signOut();
                                        }}
                                    >
                                        <LogOutIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <AuthDialog>
                                <Button variant="default" className="font-semibold">Sign In</Button>
                            </AuthDialog>
                        )}
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
