const { getAuth } = require("../config/firebase");
const { getDb } = require("../config/firebase");
const { ROLE_HIERARCHY, ACCOUNT_ROLES } = require("../config/roles");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;

    let userDoc = await getDb().collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      const newUserData = {
        name: decoded.name || decoded.email?.split("@")[0] || "User",
        email: decoded.email || "",
        photoURL: decoded.picture || "",
        accountRole: "Player",
        gameRole: "",
        status: "Active",
        playerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await getDb().collection("users").doc(decoded.uid).set(newUserData);
      userDoc = await getDb().collection("users").doc(decoded.uid).get();
    }

    req.userData = { id: decoded.uid, ...userDoc.data() };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userData) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.userData.accountRole)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
}

function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.userData) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userLevel = ROLE_HIERARCHY[req.userData.accountRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

const requireOwner = requireRole(ACCOUNT_ROLES.OWNER);
const requireAdmin = requireMinRole(ACCOUNT_ROLES.ADMIN);
const requireManager = requireMinRole(ACCOUNT_ROLES.MANAGER);
const requirePlayer = requireMinRole(ACCOUNT_ROLES.PLAYER);

function requireFinanceAccess(req, res, next) {
  if (!req.userData) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const role = req.userData.accountRole;
  if (role === ACCOUNT_ROLES.OWNER || role === ACCOUNT_ROLES.MANAGER) {
    return next();
  }
  return res.status(403).json({ error: "You do not have permission to manage finances" });
}

function requirePlayerManagement(req, res, next) {
  if (!req.userData) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const role = req.userData.accountRole;
  if (role === ACCOUNT_ROLES.OWNER || role === ACCOUNT_ROLES.ADMIN || role === ACCOUNT_ROLES.MANAGER) {
    return next();
  }
  return res.status(403).json({ error: "You do not have permission to manage players" });
}

module.exports = {
  requireAuth,
  requireRole,
  requireMinRole,
  requireOwner,
  requireAdmin,
  requireManager,
  requirePlayer,
  requireFinanceAccess,
  requirePlayerManagement,
};
