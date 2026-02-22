const protect = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  addStock,
  getStocks,
  deleteStock,
  updateStock,
  getSummary,
  refreshPrices,
  sellStock
} = require("../controllers/stockController");

router.post("/", protect, addStock);
router.get("/summary", protect, getSummary);
router.get("/", protect, getStocks);
router.delete("/:id", protect, deleteStock);
router.put("/:id", protect, updateStock);
router.put("/refresh", protect, refreshPrices);
router.put("/sell/:id", protect, sellStock);
module.exports = router;
