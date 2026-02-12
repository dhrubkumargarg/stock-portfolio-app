const Stock = require("../models/Stock");

// Add new stock
exports.addStock = async (req, res) => {
  try {
    const { name, quantity, buyPrice } = req.body;

    const newStock = new Stock({
      name,
      quantity,
      buyPrice
    });

    const savedStock = await newStock.save();

    res.status(201).json(savedStock);
  } catch (error) {
    res.status(500).json({ message: "Error adding stock" });
  }
};

// Get all stocks
exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stocks" });
  }
};

// Delete stock
exports.deleteStock = async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);

    if (!deletedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stock" });
  }
};


// Update stock
exports.updateStock = async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: "Error updating stock" });
  }
};

