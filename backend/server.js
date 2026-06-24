import express from "express";
import 'dotenv/config';
import cors from 'cors';
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is Live');
});

app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));