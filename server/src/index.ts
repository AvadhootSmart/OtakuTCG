import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth.js';
import { connectDB } from './db/db.config.js';
import { UserProfile } from './models/UserProfile.model.js';
import { seedDatabase } from './db/seed.js';
import cardRoutes from './routes/card.route.js';
import packRoutes from './routes/pack.route.js';
import userRoutes from './routes/user.route.js';
import missionRoutes from './routes/mission.route.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.all("/api/auth/*", toNodeHandler(auth))

app.use("/api/cards", cardRoutes);
app.use("/api/packs", packRoutes);
app.use("/api/user", userRoutes);
app.use("/api/missions", missionRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
});


async function startServer() {
    await connectDB();
    await seedDatabase();
    if (process.env.NODE_ENV !== "production") {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
}

startServer();

export default app;
