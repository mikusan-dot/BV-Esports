const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth, requirePlayerManagement, requireAdmin } = require("../middleware/auth");
const { GAME_ROLES, PLAYER_STATUSES, ACCOUNT_ROLES } = require("../config/roles");
const { logActivity } = require("../utils/helpers");

// Get all players
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, role, search } = req.query;
    let query = getDb().collection("players");

    if (status && status !== "All") {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    let players = [];
    snapshot.forEach((doc) => players.push({ id: doc.id, ...doc.data() }));

    if (role) {
      players = players.filter((p) => p.primaryRole === role || p.secondaryRole === role);
    }

    if (search) {
      const s = search.toLowerCase();
      players = players.filter(
        (p) =>
          (p.fullName && p.fullName.toLowerCase().includes(s)) ||
          (p.inGameName && p.inGameName.toLowerCase().includes(s)) ||
          (p.uid && p.uid.toString().includes(s))
      );
    }

    res.json(players);
  } catch (error) {
    console.error("Get players error:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

// Get single player
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const doc = await getDb().collection("players").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

// Create player
router.post("/", requireAuth, requirePlayerManagement, async (req, res) => {
  try {
    const {
      fullName, inGameName, uid, photoURL, primaryRole, secondaryRole,
      status, device, achievements, socialLinks, contactInfo, userId,
    } = req.body;

    if (!fullName || !inGameName) {
      return res.status(400).json({ error: "Full name and in-game name are required" });
    }

    const playerData = {
      fullName,
      inGameName,
      uid: uid || "",
      photoURL: photoURL || "",
      accountRole: ACCOUNT_ROLES.PLAYER,
      primaryRole: primaryRole || "",
      secondaryRole: secondaryRole || "",
      status: status || "Active",
      joinDate: new Date(),
      device: device || "",
      achievements: achievements || [],
      socialLinks: socialLinks || {},
      contactInfo: contactInfo || {},
      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getDb().collection("players").add(playerData);

    await logActivity(req.user.uid, "create_player", "player", docRef.id, `${req.userData.name} added player ${fullName} (${inGameName})`);

    res.status(201).json({ id: docRef.id, ...playerData });
  } catch (error) {
    console.error("Create player error:", error);
    res.status(500).json({ error: "Failed to create player" });
  }
});

// Update player
router.put("/:id", requireAuth, requirePlayerManagement, async (req, res) => {
  try {
    const doc = await getDb().collection("players").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Player not found" });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;
    delete updates.createdAt;

    await getDb().collection("players").doc(req.params.id).update(updates);

    if (doc.data().userId) {
      const userUpdates = { updatedAt: new Date() };
      if (req.body.primaryRole) userUpdates.gameRole = req.body.primaryRole;
      if (req.body.status) userUpdates.status = req.body.status;
      if (req.body.photoURL) userUpdates.photoURL = req.body.photoURL;
      if (req.body.fullName) userUpdates.name = req.body.fullName;
      await getDb().collection("users").doc(doc.data().userId).update(userUpdates);
    }

    await logActivity(req.user.uid, "update_player", "player", req.params.id, `${req.userData.name} updated player ${doc.data().fullName}`);

    res.json({ message: "Player updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update player" });
  }
});

// Delete player
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await getDb().collection("players").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Player not found" });
    }

    await getDb().collection("players").doc(req.params.id).delete();

    await logActivity(req.user.uid, "delete_player", "player", req.params.id, `${req.userData.name} deleted player ${doc.data().fullName}`);

    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete player" });
  }
});

// Update player role
router.put("/:id/role", requireAuth, requirePlayerManagement, async (req, res) => {
  try {
    const { primaryRole, secondaryRole, accountRole } = req.body;
    const updates = { updatedAt: new Date() };

    if (primaryRole !== undefined) updates.primaryRole = primaryRole;
    if (secondaryRole !== undefined) updates.secondaryRole = secondaryRole;
    if (accountRole !== undefined) {
      const creator = req.userData;
      if (creator.accountRole !== ACCOUNT_ROLES.OWNER && (accountRole === ACCOUNT_ROLES.OWNER)) {
        return res.status(403).json({ error: "Only Owner can assign Owner role" });
      }
      updates.accountRole = accountRole;
    }

    await getDb().collection("players").doc(req.params.id).update(updates);

    const doc = await getDb().collection("players").doc(req.params.id).get();
    if (doc.exists && doc.data().userId) {
      const userUpdates = { updatedAt: new Date() };
      if (primaryRole) userUpdates.gameRole = primaryRole;
      if (accountRole) userUpdates.accountRole = accountRole;
      await getDb().collection("users").doc(doc.data().userId).update(userUpdates);
    }

    await logActivity(req.user.uid, "change_player_role", "player", req.params.id, `${req.userData.name} changed role for ${doc.data()?.fullName || req.params.id}`);

    res.json({ message: "Player role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update player role" });
  }
});

module.exports = router;
