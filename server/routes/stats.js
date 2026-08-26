const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    const playersSnap = await getDb().collection("players").get();
    const usersSnap = await getDb().collection("users").get();
    const txSnap = await getDb().collection("transactions").get();

    let totalPlayers = 0;
    let activePlayers = 0;
    let managers = 0;
    let admins = 0;
    let substitutes = 0;

    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.accountRole === "Manager") managers++;
      if (data.accountRole === "Admin") admins++;
    });

    playersSnap.forEach((doc) => {
      const data = doc.data();
      totalPlayers++;
      if (data.status === "Active") activePlayers++;
      if (data.status === "Substitute") substitutes++;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const monthlyData = {};

    txSnap.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.amount) || 0;
      const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (data.type === "income") {
        totalIncome += amount;
        monthlyData[monthKey].income += amount;
      } else {
        totalExpenses += amount;
        monthlyData[monthKey].expenses += amount;
      }
    });

    res.json({
      totalPlayers,
      activePlayers,
      substitutes,
      managers,
      admins,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlyData,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
