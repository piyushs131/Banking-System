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
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
// Allow all localhost ports (Vite may use 5173, 5174, 5178, etc.)
const corsOptions = {
  origin: (origin, cb) => {
    const allowed = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    cb(null, allowed);
  },
  credentials: true,
};
app.use(cors(corsOptions));
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

// Global error handler - catch any unhandled errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
