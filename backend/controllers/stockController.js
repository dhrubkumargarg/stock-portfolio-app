const Stock = require("../models/Stock");
const axios = require("axios");

/* ===========================
   🔥 LIVE PRICE FUNCTION
=========================== */
async function getLivePrice(symbol) {

  console.log("API KEY:", process.env.ALPHA_VANTAGE_API_KEY); // 👈 ADD THIS LINE
  console.log("Fetching live price for:", symbol);            // optional debug

  try {
    const response = await axios.get(
      "https://www.alphavantage.co/query",
      {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
      }
    );

    console.log("API Response:", response.data); // 👈 ADD THIS TOO

    if (!response.data["Global Quote"] ||
        !response.data["Global Quote"]["05. price"]) {
      return null;
    }

    return parseFloat(response.data["Global Quote"]["05. price"]);

  } catch (error) {
    console.log("Live price fetch failed:", error.message);
    return null;
  }
}

/* ===========================
   ➕ ADD STOCK (LIVE PRICE)
=========================== */

exports.addStock = async (req, res) => {
  try {
    const { name, quantity } = req.body;

    const livePrice = await getLivePrice(name);

    if (!livePrice) {
      return res.status(400).json({ message: "Invalid symbol" });
    }

    const newStock = new Stock({
      name,
      quantity,
      buyPrice: livePrice,     // 👈 Buy at live price
      currentPrice: livePrice,
      user: req.user
    });

    const savedStock = await newStock.save();
    res.status(201).json(savedStock);

  } catch (error) {
    res.status(500).json({ message: "Error adding stock" });
  }
};

/* ===========================
   📋 GET USER STOCKS
=========================== */

exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stocks" });
  }
};

/* ===========================
   ✏ UPDATE STOCK
=========================== */

exports.updateStock = async (req, res) => {
  try {
    const { name, quantity, buyPrice } = req.body;

    const stock = await Stock.findOne({
      _id: req.params.id,
      user: req.user
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    stock.name = name || stock.name;
    stock.quantity = quantity || stock.quantity;
    stock.buyPrice = buyPrice || stock.buyPrice;

    const livePrice = await getLivePrice(stock.name);
    if (livePrice) {
      stock.currentPrice = livePrice;
    }

    const updatedStock = await stock.save();

    res.json(updatedStock);

  } catch (error) {
    res.status(500).json({ message: "Error updating stock" });
  }
};

/* ===========================
   ❌ DELETE STOCK
=========================== */

exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({
      _id: req.params.id,
      user: req.user
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.json({ message: "Stock deleted" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting stock" });
  }
};

/* ===========================
   📊 PORTFOLIO SUMMARY
=========================== */

exports.getSummary = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });

    let totalInvestment = 0;
    let totalPortfolioValue = 0;
    let totalQuantity = 0;

    stocks.forEach(stock => {
      totalInvestment += stock.buyPrice * stock.quantity;
      totalPortfolioValue += stock.currentPrice * stock.quantity;
      totalQuantity += stock.quantity;
    });

    const totalProfitLoss = totalPortfolioValue - totalInvestment;

    res.json({
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


exports.refreshPrices = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });

    for (let stock of stocks) {
      const livePrice = await getLivePrice(stock.name);
      if (livePrice) {
        stock.currentPrice = livePrice;
        await stock.save();
      }
    }

    res.json({ message: "Prices updated" });

  } catch (error) {
    res.status(500).json({ message: "Error refreshing prices" });
  }
};

exports.sellStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    const stock = await Stock.findOne({
      _id: req.params.id,
      user: req.user
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    if (quantity > stock.quantity) {
      return res.status(400).json({ message: "Not enough shares" });
    }

    stock.quantity -= quantity;

    if (stock.quantity === 0) {
      await stock.deleteOne();
    } else {
      await stock.save();
    }

    res.json({ message: "Stock sold successfully" });

  } catch (error) {
    res.status(500).json({ message: "Sell failed" });
  }
};