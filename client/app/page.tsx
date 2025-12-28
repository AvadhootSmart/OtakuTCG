"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Users, Package } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="hero" className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-5xl md:text-7xl rock-salt text-foreground mb-8 leading-tight">
              Anime Trading
              <br />
              Card Game
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Embark on an epic journey through the world of anime. Collect,
              battle, and become the ultimate champion.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-muted-foreground px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Play vs AI
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Play vs Human
              </Button>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Explore Packs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl rock-salt text-foreground mb-6">
              Epic Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes OtakuTCG the ultimate anime trading card
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:border-foreground/20 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-background" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  AI Battles
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Challenge our advanced AI opponents with adaptive difficulty
                  levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-foreground/20 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-background" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  Multiplayer
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Battle friends and players worldwide in real-time matches
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-foreground/20 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-background" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  Card Collection
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Collect rare and legendary cards from your favorite anime
                  series
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-foreground mb-2">
                1000+
              </div>
              <div className="text-muted-foreground">Unique Cards</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">Anime Series</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-foreground mb-2">
                10K+
              </div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="text-3xl font-bold text-foreground mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">Game Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="cta" className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl rock-salt text-foreground mb-6">
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Join thousands of players in the ultimate anime trading card
            experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-muted-foreground px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-border text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Package className="w-5 h-5 mr-2" />
              View Card Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 OtakuTCG. All rights reserved. | Made with ❤️ for anime fans
          </p>
        </div>
      </footer>
    </div>
  );
}
