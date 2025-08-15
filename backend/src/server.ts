// src/server.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import navigationRoutes from "./routes/navigationRoutes";
import familyMemberRoutes from "./routes/familyMemberRoutes";

dotenv.config();
connectDB();

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Basic Route
app.get("/api", (req: Request, res: Response) => {
  res.send("API for FamilySite is running...");
});

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/family-members", familyMemberRoutes);

// Use Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
