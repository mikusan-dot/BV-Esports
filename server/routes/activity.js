const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit: queryLimit } = req.query;
    const snapshot = await getDb().collection("activityLogs").orderBy("createdAt", "desc").limit(parseInt(queryLimit) || 50).get();
    const logs = [];
    snapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

module.exports = router;
