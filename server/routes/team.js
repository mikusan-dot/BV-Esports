const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth, requireOwner } = require("../middleware/auth");
const { logActivity } = require("../utils/helpers");

const DEFAULT_SETTINGS = {
  name: "BV Esports",
  shortName: "BV",
  logoURL: "",
  game: "Free Fire",
  description: "Professional Free Fire Esports Team",
  country: "Bangladesh",
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    discord: "",
  },
  contactInfo: {
    email: "",
    phone: "",
  },
  updatedAt: new Date(),
};

// Get team settings
router.get("/", requireAuth, async (req, res) => {
  try {
    const doc = await getDb().collection("team").doc("settings").get();
    if (!doc.exists) {
      await getDb().collection("team").doc("settings").set(DEFAULT_SETTINGS);
      return res.json({ id: "settings", ...DEFAULT_SETTINGS });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team settings" });
  }
});

// Update team settings
router.put("/", requireAuth, requireOwner, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;

    await getDb().collection("team").doc("settings").set(updates, { merge: true });

    await logActivity(req.user.uid, "update_team_settings", "team", "settings", `${req.userData.name} updated team settings`);

    res.json({ message: "Team settings updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update team settings" });
  }
});

module.exports = router;
