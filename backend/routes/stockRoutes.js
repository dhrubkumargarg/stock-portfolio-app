const express = require("express");
const router = express.Router();

const {
  addStock,
  getStocks,
  deleteStock,
  updateStock
} = require("../controllers/stockController");

// POST - Add stock
router.post("/", addStock);

// GET - Get all stocks
router.get("/", getStocks);

// DELETE - Delete stock
router.delete("/:id", deleteStock);

// PUT - Update stock
router.put("/:id", updateStock);

module.exports = router;
