const protect = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  addStock,
  getStocks,
  deleteStock,
  updateStock,
  getSummary
} = require("../controllers/stockController");

router.post("/", protect, addStock);
router.get("/summary", protect, getSummary);
router.get("/", protect, getStocks);
router.delete("/:id", protect, deleteStock);
router.put("/:id", protect, updateStock);


module.exports = router;
