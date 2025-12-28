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
import userRoutes from './routes/user.route';

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
app.use("/api/user", userRoutes);

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
