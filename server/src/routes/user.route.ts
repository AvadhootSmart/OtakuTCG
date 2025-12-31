import { Router } from "express";
import { auth } from "../utils/auth.js";
import { UserProfile } from "../models/UserProfile.model.js";

const router = Router();

// Get profile
router.get("/profile", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        let profile = await UserProfile.findOne({ userId: session.user.id })
            .populate("ownedCards.cardId")
            .populate("inventoryPacks.packId");

        if (!profile) {
            profile = await UserProfile.create({
                userId: session.user.id,
                balance: 1000
            });
        } else {
            profile.inventoryPacks = profile.inventoryPacks.filter((p: any) => p.packId !== null);
            profile.ownedCards = profile.ownedCards.filter((c: any) => c.cardId !== null);

            if (profile.balance < 100 && profile.inventoryPacks.length === 0 && profile.ownedCards.length === 0) {
                profile.balance += 1000;
            }

            await profile.save();
            profile = await UserProfile.findOne({ userId: session.user.id })
                .populate("ownedCards.cardId")
                .populate("inventoryPacks.packId");
        }
        res.json(profile);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Buy currency
router.post("/buy-currency", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const profile = await UserProfile.findOne({ userId: session.user.id });
        if (!profile) return res.status(404).json({ error: "Profile not found" });

        profile.balance += amount;
        await profile.save();

        res.json({ message: "Currency purchased successfully", balance: profile.balance });
    } catch (error) {
        console.error("Buy currency error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
