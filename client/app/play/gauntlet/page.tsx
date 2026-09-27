import Link from "next/link";
import { EmptyState, GameShell } from "@/components/game-shell";

export default function GauntletPage() {
    return (
        <GameShell>
            <EmptyState
                title="Gauntlet is sealed"
                body="A ladder of escalating duels is coming in a future season."
                action={<Link href="/" className="btn btn-ghost h-11 px-6 text-sm">Back to lobby</Link>}
            />
        </GameShell>
    );
}
