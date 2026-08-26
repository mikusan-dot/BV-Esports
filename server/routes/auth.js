const express = require("express");
const router = express.Router();
const { getAuth, getDb } = require("../config/firebase");
const { requireAuth, requireOwner, requireAdmin } = require("../middleware/auth");
const { ACCOUNT_ROLES, PERMISSIONS } = require("../config/roles");
const { logActivity } = require("../utils/helpers");

// Register (client creates Firebase Auth user first, then calls this to create Firestore docs)
router.post("/register", async (req, res) => {
  try {
    const { uid, email, name, inGameName } = req.body;
    if (!uid || !email || !name) {
      return res.status(400).json({ error: "UID, email, and name are required" });
    }

    const existing = await getDb().collection("users").doc(uid).get();
    if (existing.exists) {
      return res.status(200).json({ message: "User profile already exists", uid });
    }

    await getDb().collection("users").doc(uid).set({
      name,
      email,
      photoURL: "",
      accountRole: ACCOUNT_ROLES.PLAYER,
      gameRole: "",
      status: "Active",
      playerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (inGameName) {
      const playerRef = await getDb().collection("players").add({
        fullName: name,
        inGameName,
        uid: "",
        photoURL: "",
        accountRole: ACCOUNT_ROLES.PLAYER,
        primaryRole: "",
        secondaryRole: "",
        status: "Active",
        joinDate: new Date(),
        device: "",
        achievements: [],
        socialLinks: {},
        contactInfo: {},
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await getDb().collection("users").doc(uid).update({ playerId: playerRef.id });
    }

    res.status(201).json({ message: "User registered successfully", uid });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

// Admin create user with specific role
router.post("/create-user", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, accountRole, gameRole, inGameName } = req.body;
    const creator = req.userData;

    if (creator.accountRole !== ACCOUNT_ROLES.OWNER && (accountRole === ACCOUNT_ROLES.OWNER || accountRole === ACCOUNT_ROLES.ADMIN)) {
      return res.status(403).json({ error: "Only the Owner can create Admins or Owners" });
    }

    const allowedRoles = [ACCOUNT_ROLES.PLAYER, ACCOUNT_ROLES.MANAGER, ACCOUNT_ROLES.ADMIN];
    if (creator.accountRole !== ACCOUNT_ROLES.OWNER && !allowedRoles.includes(accountRole)) {
      return res.status(403).json({ error: "You cannot create users with this role" });
    }

    const userRecord = await getAuth().createUser({ email, password, displayName: name });

    const userData = {
      name,
      email,
      photoURL: "",
      accountRole: accountRole || ACCOUNT_ROLES.PLAYER,
      gameRole: gameRole || "",
      status: "Active",
      playerId: null,
      createdBy: creator.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await getDb().collection("users").doc(userRecord.uid).set(userData);

    if (inGameName) {
      const playerRef = await getDb().collection("players").add({
        fullName: name,
        inGameName,
        uid: "",
        photoURL: "",
        accountRole: accountRole || ACCOUNT_ROLES.PLAYER,
        primaryRole: gameRole || "",
        secondaryRole: "",
        status: "Active",
        joinDate: new Date(),
        device: "",
        achievements: [],
        socialLinks: {},
        contactInfo: {},
        userId: userRecord.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await getDb().collection("users").doc(userRecord.uid).update({ playerId: playerRef.id });
    }

    await logActivity(creator.id, "create_user", "user", userRecord.uid, `${creator.name} created user ${name} with role ${accountRole}`);

    res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
});

// Get current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userDoc = await getDb().collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Get all users (admin+)
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snapshot = await getDb().collection("users").orderBy("createdAt", "desc").get();
    const users = [];
    snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Change user role
router.put("/users/:uid/role", requireAuth, requireOwner, async (req, res) => {
  try {
    const { uid } = req.params;
    const { accountRole, gameRole } = req.body;

    if (uid === req.user.uid) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }

    if (!Object.values(ACCOUNT_ROLES).includes(accountRole)) {
      return res.status(400).json({ error: "Invalid account role" });
    }

    const updates = { accountRole, updatedAt: new Date() };
    if (gameRole !== undefined) updates.gameRole = gameRole;

    await getDb().collection("users").doc(uid).update(updates);

    const targetUser = await getDb().collection("users").doc(uid).get();
    if (targetUser.exists && targetUser.data().playerId) {
      await getDb().collection("players").doc(targetUser.data().playerId).update({
        accountRole,
        primaryRole: gameRole || targetUser.data().gameRole,
        updatedAt: new Date(),
      });
    }

    await logActivity(req.user.uid, "change_role", "user", uid, `${req.userData.name} changed ${targetUser.data()?.name}'s role to ${accountRole}`);

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Delete user
router.delete("/users/:uid", requireAuth, requireOwner, async (req, res) => {
  try {
    const { uid } = req.params;
    if (uid === req.user.uid) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    const userDoc = await getDb().collection("users").doc(uid).get();
    if (userDoc.exists && userDoc.data().playerId) {
      await getDb().collection("players").doc(userDoc.data().playerId).delete();
    }

    await getDb().collection("users").doc(uid).delete();
    await getAuth().deleteUser(uid);

    await logActivity(req.user.uid, "delete_user", "user", uid, `${req.userData.name} deleted user ${userDoc.data()?.name || uid}`);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
