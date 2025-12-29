import { Router } from "express";
import { Card } from "../models/Card.model";
import { auth } from "../utils/auth";

const router = Router();

// Get all cards
router.get("/", async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cards" });
    }
});

// Get single card
router.get("/:id", async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: "Card not found" });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch card" });
    }
});

// Create card (Admin only - for now just check session)
router.post("/", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const card = await Card.create(req.body);
        res.status(201).json(card);
    } catch (error) {
        res.status(400).json({ error: "Failed to create card" });
    }
});

// Create multiple cards in a single request
router.post("/bulk", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const { cards } = req.body;

        // Validate that cards is an array
        if (!Array.isArray(cards)) {
            return res.status(400).json({ error: "Request body must contain a 'cards' array" });
        }

        if (cards.length === 0) {
            return res.status(400).json({ error: "Cards array cannot be empty" });
        }

        // Create all cards at once using insertMany for better performance
        const createdCards = await Card.insertMany(cards);

        res.status(201).json({
            message: `Successfully created ${createdCards.length} cards`,
            cards: createdCards
        });
    } catch (error) {
        res.status(400).json({ error: "Failed to create cards" });
    }
});

// Update card
router.put("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!card) return res.status(404).json({ error: "Card not found" });
        res.json(card);
    } catch (error) {
        res.status(400).json({ error: "Failed to update card" });
    }
});

// Delete card
router.delete("/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) return res.status(401).json({ error: "Unauthorized" });

        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) return res.status(404).json({ error: "Card not found" });
        res.json({ message: "Card deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete card" });
    }
});

export default router;
