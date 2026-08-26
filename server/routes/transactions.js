const express = require("express");
const router = express.Router();
const { getDb } = require("../config/firebase");
const { requireAuth, requireFinanceAccess } = require("../middleware/auth");
const { TRANSACTION_TYPES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } = require("../config/roles");
const { logActivity } = require("../utils/helpers");

// Get all transactions
router.get("/", requireAuth, async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = getDb().collection("transactions");

    if (type && type !== "all") {
      query = query.where("type", "==", type);
    }

    const snapshot = await query.orderBy("date", "desc").get();
    let transactions = [];
    snapshot.forEach((doc) => transactions.push({ id: doc.id, ...doc.data() }));

    if (category) {
      transactions = transactions.filter((t) => t.category === category);
    }
    if (startDate) {
      transactions = transactions.filter((t) => new Date(t.date?.toDate ? t.date.toDate() : t.date) >= new Date(startDate));
    }
    if (endDate) {
      transactions = transactions.filter((t) => new Date(t.date?.toDate ? t.date.toDate() : t.date) <= new Date(endDate));
    }

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get finance summary
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const snapshot = await getDb().collection("transactions").get();
    let totalIncome = 0;
    let totalExpenses = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.type === TRANSACTION_TYPES.INCOME) totalIncome += Number(data.amount) || 0;
      if (data.type === TRANSACTION_TYPES.EXPENSE) totalExpenses += Number(data.amount) || 0;
    });

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Create transaction
router.post("/", requireAuth, requireFinanceAccess, async (req, res) => {
  try {
    const { type, amount, category, description, date, reference } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: "Type, amount, and category are required" });
    }

    if (!Object.values(TRANSACTION_TYPES).includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    if (!allCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const transactionData = {
      type,
      amount: Number(amount),
      category,
      description: description || "",
      date: date ? new Date(date) : new Date(),
      createdBy: req.userData.name || req.user.uid,
      createdById: req.user.uid,
      reference: reference || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getDb().collection("transactions").add(transactionData);

    const action = type === TRANSACTION_TYPES.INCOME ? "income" : "expense";
    await logActivity(req.user.uid, `add_${action}`, "transaction", docRef.id, `${req.userData.name} added ${action}: ${category} - ৳${amount}`);

    res.status(201).json({ id: docRef.id, ...transactionData });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// Update transaction
router.put("/:id", requireAuth, requireFinanceAccess, async (req, res) => {
  try {
    const doc = await getDb().collection("transactions").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.createdById;

    if (updates.amount) updates.amount = Number(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    await getDb().collection("transactions").doc(req.params.id).update(updates);

    await logActivity(req.user.uid, "update_transaction", "transaction", req.params.id, `${req.userData.name} updated transaction`);

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Delete transaction
router.delete("/:id", requireAuth, requireFinanceAccess, async (req, res) => {
  try {
    const doc = await getDb().collection("transactions").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await getDb().collection("transactions").doc(req.params.id).delete();

    await logActivity(req.user.uid, "delete_transaction", "transaction", req.params.id, `${req.userData.name} deleted transaction: ${doc.data().category} - ৳${doc.data().amount}`);

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;
