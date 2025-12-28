import { Router } from "express";
import { Pack } from "../models/Pack.model";
import { Card, ICard } from "../models/Card.model";
import { auth } from "../utils/auth";
import { calculatePackProbabilities } from "../utils/rarity";
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
        res.status(21).json(pack);
    } catch (error) {
        res.status(400).json({ error: "Failed to create pack" });
    }
});

// Update pack before saving to handle probability calculation
router.put("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        // If cards are being updated, we need to recalculate probabilities
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

        // Deduct balance
        profile.balance -= pack.price;

        // Add pack to inventory
        const existingPack = profile.inventoryPacks.find((p: any) => p.packId === pack._id.toString());
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

export default router;
