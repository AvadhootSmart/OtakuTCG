import { Router } from "express";
import { Mission } from "../models/Mission.model.js";
import { UserProfile } from "../models/UserProfile.model.js";
import { auth } from "../utils/auth.js";

const router = Router();

// Get all missions
router.get("/", async (req, res) => {
    try {
        const missions = await Mission.find();
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch missions" });
    }
});

// Get single mission
router.get("/:id", async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ error: "Mission not found" });
        res.json(mission);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch mission" });
    }
});

// Create mission (Admin only)
router.post("/", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });
        // Optional: Check if user is admin (based on session data if available)

        const mission = await Mission.create(req.body);
        res.status(201).json(mission);
    } catch (error) {
        res.status(400).json({ error: "Failed to create mission" });
    }
});

// Update mission
router.put("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mission) return res.status(404).json({ error: "Mission not found" });
        res.json(mission);
    } catch (error) {
        res.status(400).json({ error: "Failed to update mission" });
    }
});

// Delete mission
router.delete("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) return res.status(404).json({ error: "Mission not found" });
        res.json({ message: "Mission deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete mission" });
    }
});

// Complete mission
router.post("/:id/complete", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const { submitted_cards } = req.body;
        if (!submitted_cards || !Array.isArray(submitted_cards)) {
            return res.status(400).json({ error: "Invalid submitted cards" });
        }

        const mission = await Mission.findById(req.params.id);
        if (!mission) return res.status(404).json({ error: "Mission not found" });

        const profile = await UserProfile.findOne({ userId: session.user.id });
        if (!profile) return res.status(404).json({ error: "User profile not found" });

        // 1. Remove cards from profile
        for (const cardId of submitted_cards) {
            const cardIndex = profile.ownedCards.findIndex((oc: any) => oc.cardId.toString() === cardId);
            if (cardIndex === -1) {
                return res.status(400).json({ error: `User does not own card ${cardId}` });
            }

            if (profile.ownedCards[cardIndex].count > 1) {
                profile.ownedCards[cardIndex].count -= 1;
            } else {
                profile.ownedCards.splice(cardIndex, 1);
            }
        }

        // 2. Add rewards
        profile.xp += mission.rewardXp;

        if (mission.rewardType === 'coins' && mission.rewardCoins) {
            profile.balance += mission.rewardCoins;
        } else if (mission.rewardType === 'pack' && mission.rewardPackId) {
            const packIndex = profile.inventoryPacks.findIndex((ip: any) => ip.packId.toString() === mission.rewardPackId.toString());
            if (packIndex > -1) {
                profile.inventoryPacks[packIndex].count += 1;
            } else {
                profile.inventoryPacks.push({
                    packId: mission.rewardPackId,
                    count: 1,
                    obtainedAt: new Date()
                });
            }
        } else if (mission.rewardType === 'card' && mission.rewardCardId) {
            const cardIndex = profile.ownedCards.findIndex((oc: any) => oc.cardId.toString() === mission.rewardCardId.toString());
            if (cardIndex > -1) {
                profile.ownedCards[cardIndex].count += 1;
            } else {
                profile.ownedCards.push({
                    cardId: mission.rewardCardId,
                    count: 1,
                    obtainedAt: new Date()
                });
            }
        }

        // 3. Stats if needed (e.g. mission count)

        await profile.save();

        res.json({
            message: "Mission completed successfully!",
            xpGained: mission.rewardXp,
            reward: mission.rewardType
        });

    } catch (error) {
        console.error("Complete mission error:", error);
        res.status(500).json({ error: "Failed to complete mission" });
    }
});

export default router;
