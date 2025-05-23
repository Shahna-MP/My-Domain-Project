// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    // these options are now defaults in newer drivers, but harmless if present
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

// ─── Serve React Frontend ─────────────────────────────────────────────────────
// 1. Build your frontend: run `npm run build` inside `/frontend` → creates `/frontend/dist`
// 2. Express will serve those static files here:
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 3. For any other route, send back React’s index.html so client-side routing works:
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ─── Error Handling ────────────────────────────────────────────────────────────
// 404 handler (if no routes matched above)
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
