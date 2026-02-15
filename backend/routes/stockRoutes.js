const express = require("express");
const router = express.Router();

const {
  addStock,
  getStocks,
  deleteStock,
  updateStock,
  getSummary
} = require("../controllers/stockController");

// ➕ Add new stock
router.post("/", addStock);

// 📊 Get portfolio summary (MUST come before /:id routes)
router.get("/summary", getSummary);

// 📄 Get all stocks
router.get("/", getStocks);

// ❌ Delete stock by ID
router.delete("/:id", deleteStock);

// ✏️ Update stock by ID
router.put("/:id", updateStock);

module.exports = router;
