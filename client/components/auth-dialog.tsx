"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "../lib/auth-client";

type AuthMode = "signin" | "signup";

interface AuthDialogProps {
  children: React.ReactNode;
}

export function AuthDialog({ children }: AuthDialogProps) {
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    email: "",
    username: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const res = await authClient.signIn.email({
          email: form.email,
          password: form.password,
        });
        if (res.error) {
          setError(res.error.message || "Failed to sign in");
        } else {
          setOpen(false);
        }
      } else {
        const res = await authClient.signUp.email({
          email: form.email,
          password: form.password,
          name: form.username,
        });
        if (res.error) {
          setError(res.error.message || "Failed to create account");
        } else {
          setOpen(false);
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="eyebrow">{mode === "signin" ? "Return to the arena" : "New challenger"}</div>
          <DialogTitle className="text-4xl italic">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to open packs, build squads and take on missions."
              : "Register to claim your coins and start your collection."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username" className="eyebrow text-muted-foreground">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="yourname"
                value={form.username}
                onChange={handleChange}
                className="h-11"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="eyebrow text-muted-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="eyebrow text-muted-foreground">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="h-11"
              required
            />
          </div>

          {error && (
            <div className="border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-gold h-12 w-full text-base" disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Don’t have an account? " : "Already have an account? "}
          <button
            type="button"
            className="font-medium text-gold underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}