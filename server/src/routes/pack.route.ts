import { Router } from "express";
import { Pack } from "../models/Pack.model";
import { Card, ICard } from "../models/Card.model";
import { auth } from "../utils/auth";
import { calculatePackProbabilities, drawCardFromPack } from "../utils/rarity";
import { UserProfile } from "../models/UserProfile.model";

const router = Router();

// Get all packs
router.get("/", async (req, res) => {
    try {
        const packs = await Pack.find().populate("cards");
        res.json(packs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch packs" });
    }
});

// Get single pack
router.get("/:id", async (req, res) => {
    try {
        const pack = await Pack.findById(req.params.id).populate("cards");
        if (!pack) return res.status(404).json({ error: "Pack not found" });
        res.json(pack);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pack" });
    }
});

// Create pack
router.post("/", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        if (req.body.cards && req.body.cards.length > 0) {
            const cards = (await Card.find({ _id: { $in: req.body.cards } })) as ICard[];
            req.body.probabilities = calculatePackProbabilities(cards);
        }

        const pack = await Pack.create(req.body);
        res.status(201).json(pack);
    } catch (error) {
        res.status(400).json({ error: "Failed to create pack" });
    }
});

// Update pack
router.put("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        if (req.body.cards) {
            const cards = (await Card.find({ _id: { $in: req.body.cards } })) as ICard[];
            req.body.probabilities = calculatePackProbabilities(cards);
        }

        const pack = await Pack.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pack) return res.status(404).json({ error: "Pack not found" });
        res.json(pack);
    } catch (error) {
        res.status(400).json({ error: "Failed to update pack" });
    }
});

// Delete pack
router.delete("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const pack = await Pack.findByIdAndDelete(req.params.id);
        if (!pack) return res.status(404).json({ error: "Pack not found" });
        res.json({ message: "Pack deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete pack" });
    }
});

// Buy pack
router.post("/buy/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const pack = await Pack.findById(req.params.id);
        if (!pack) return res.status(404).json({ error: "Pack not found" });

        const profile = await UserProfile.findOne({ userId: session.user.id });
        if (!profile) return res.status(404).json({ error: "User profile not found" });

        if (profile.balance < pack.price) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        profile.balance -= pack.price;

        const existingPack = profile.inventoryPacks.find((p: any) => p.packId.toString() === pack._id.toString());
        if (existingPack) {
            existingPack.count += 1;
        } else {
            profile.inventoryPacks.push({
                packId: pack._id.toString(),
                count: 1,
                obtainedAt: new Date()
            });
        }

        await profile.save();
        res.json({ message: "Pack purchased successfully", balance: profile.balance, profile });
    } catch (error) {
        console.error("Buy pack error:", error);
        res.status(500).json({ error: "Failed to purchase pack" });
    }
});

// Open pack
router.post("/open/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const profile = await UserProfile.findOne({ userId: session.user.id });
        if (!profile) return res.status(404).json({ error: "User profile not found" });

        const packIdx = profile.inventoryPacks.findIndex((p: any) => p.packId.toString() === req.params.id);
        if (packIdx === -1 || profile.inventoryPacks[packIdx].count <= 0) {
            return res.status(400).json({ error: "You don't own this pack" });
        }

        const pack = await Pack.findById(req.params.id).populate("cards");
        if (!pack) return res.status(404).json({ error: "Pack data not found" });

        const selectedCard = drawCardFromPack(pack.cards);

        profile.inventoryPacks[packIdx].count -= 1;
        if (profile.inventoryPacks[packIdx].count === 0) {
            profile.inventoryPacks.splice(packIdx, 1);
        }

        const existingCard = profile.ownedCards.find((c: any) => c.cardId.toString() === selectedCard._id.toString());
        if (existingCard) {
            existingCard.count += 1;
        } else {
            profile.ownedCards.push({
                cardId: selectedCard._id,
                count: 1,
                obtainedAt: new Date()
            });
        }

        await profile.save();

        res.json({
            message: "Pack opened successfully",
            card: selectedCard,
            remainingPacks: profile.inventoryPacks
        });
    } catch (error) {
        console.error("Open pack error:", error);
        res.status(500).json({ error: "Failed to open pack" });
    }
});

export default router;
