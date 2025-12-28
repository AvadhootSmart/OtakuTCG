import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';
import { connectDB } from './db/db.config';
import { UserProfile } from './models/UserProfile.model';
import { seedDatabase } from './db/seed';
import cardRoutes from './routes/card.route';
import packRoutes from './routes/pack.route';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.all("/api/auth/*", toNodeHandler(auth))

app.use("/api/cards", cardRoutes);
app.use("/api/packs", packRoutes);

app.get('/api/profile', async (req, res) => {
    try {
        const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const profile = await UserProfile.findOne({ userId: session.user.id })
            .populate("ownedCards.cardId")
            .populate("inventoryPacks.packId");
        if (!profile) {
            // Create profile if it doesn't exist for some reason
            const newProfile = await UserProfile.create({
                userId: session.user.id,
                balance: 500
            });
            return res.json(newProfile);
        }
        res.json(profile);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
});


async function startServer() {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
