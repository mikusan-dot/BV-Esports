const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth, requireAdmin, requireMinRole } = require("../middleware/auth");
const { ACCOUNT_ROLES, ANNOUNCEMENT_PRIORITIES } = require("../config/roles");
const { logActivity } = require("../utils/helpers");

// Get all announcements
router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await getDb().collection("announcements").orderBy("createdAt", "desc").get();
    const announcements = [];
    snapshot.forEach((doc) => announcements.push({ id: doc.id, ...doc.data() }));
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// Create announcement
router.post("/", requireAuth, requireMinRole(ACCOUNT_ROLES.MANAGER), async (req, res) => {
  try {
    const { title, message, priority } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const data = {
      title,
      message,
      priority: priority || ANNOUNCEMENT_PRIORITIES.NORMAL,
      createdBy: req.userData.name || req.user.uid,
      createdById: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getDb().collection("announcements").add(data);

    await logActivity(req.user.uid, "create_announcement", "announcement", docRef.id, `${req.userData.name} created announcement: ${title}`);

    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Update announcement
router.put("/:id", requireAuth, requireMinRole(ACCOUNT_ROLES.MANAGER), async (req, res) => {
  try {
    const doc = await getDb().collection("announcements").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.createdById;

    await getDb().collection("announcements").doc(req.params.id).update(updates);
    res.json({ message: "Announcement updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// Delete announcement
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await getDb().collection("announcements").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await getDb().collection("announcements").doc(req.params.id).delete();
    await logActivity(req.user.uid, "delete_announcement", "announcement", req.params.id, `${req.userData.name} deleted announcement: ${doc.data().title}`);

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
