const { getDb } = require("../config/firebase");

async function logActivity(userId, action, targetType, targetId, description) {
  try {
    await getDb().collection("activityLogs").add({
      userId,
      action,
      targetType,
      targetId: targetId || null,
      description,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = { logActivity, generateId };
