require("dotenv").config();              // Load env vars first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());                          // Enable CORS for all routes
app.use(express.json());                  // Parse JSON bodies

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── API Routes ────────────────────────────────────────────────────────────────
const domainRoutes = require("./routes/DomainRoutes");
const authRoutes   = require("./routes/AuthRoutes");

app.use("/api/domains", domainRoutes);
app.use("/api/auth",    authRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
