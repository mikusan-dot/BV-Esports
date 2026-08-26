require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { initializeFirebase } = require("./config/firebase");

const authRoutes = require("./routes/auth");
const playerRoutes = require("./routes/players");
const transactionRoutes = require("./routes/transactions");
const announcementRoutes = require("./routes/announcements");
const activityRoutes = require("./routes/activity");
const teamRoutes = require("./routes/team");
const statsRoutes = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 5000;

initializeFirebase();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/stats", statsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`BV Esports server running on port ${PORT}`);
});

module.exports = app;