const Stock = require("../models/Stock");

// Add new stock
exports.addStock = async (req, res) => {
  try {
    const { name, quantity, buyPrice, currentPrice } = req.body;

    const newStock = new Stock({
      name,
      quantity,
      buyPrice,
      currentPrice,
      user: req.user   // 🔥 attach logged-in user
    });

    const savedStock = await newStock.save();
    res.status(201).json(savedStock);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding stock" });
  }
};



// Get all stocks
exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });
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
    console.error(error);
    res.status(500).json({ message: "Error updating stock" });
  }
};


// Get portfolio summary
exports.getSummary = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user }    );

    let totalInvestment = 0;
    let totalQuantity = 0;
    let totalPortfolioValue = 0;
    let totalProfitLoss = 0;

    stocks.forEach(stock => {
      totalInvestment += stock.quantity * stock.buyPrice;
      totalQuantity += stock.quantity;
      totalPortfolioValue += stock.currentPrice * stock.quantity;
      totalProfitLoss += (stock.currentPrice - stock.buyPrice) * stock.quantity;
    });

    res.status(200).json({
      totalInvestment,
      totalPortfolioValue,
      totalProfitLoss,
      totalStocks: stocks.length,
      totalQuantity
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating summary" });
  }
};
