import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import profileRoutes from "./routes/profile.route.js";
import serviceRequestRoutes from "./routes/serviceRequest.route.js";
import connectDB from "./db/connectDB.js";
import securityHeaders from "./middleware/securityHeaders.js";
const rateLimiter = require("./middleware/rateLimiter.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true,
  })
);
app.use(securityHeaders);

// Apply rate limiting to all requests
app.use(rateLimiter);

// Connect to DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
