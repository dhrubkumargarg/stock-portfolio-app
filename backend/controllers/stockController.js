const axios = require("axios");
const Stock = require("../models/Stock");
const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();

/* ===========================
   🔥 LIVE PRICE FUNCTION (YAHOO)
=========================== */

async function getLivePrice(symbol) {
  try {
    const formattedSymbol = symbol.trim().toUpperCase();

    const response = await axios.get("https://api.twelvedata.com/price", {
      params: {
        symbol: formattedSymbol,
        apikey: process.env.TWELVEDATA_API_KEY
      }
    });

    console.log("TwelveData response:", response.data);

    if (!response.data || response.data.status === "error") {
      return null;
    }

    return parseFloat(response.data.price);

  } catch (error) {
    console.log("TwelveData fetch failed:", error.message);
    return null;
  }
}
/* ===========================
   ➕ ADD STOCK
=========================== */

exports.addStock = async (req, res) => {
  try {
    const { name, quantity } = req.body;

    const symbol = name.trim().toUpperCase();

    const livePrice = await getLivePrice(symbol);

    if (!livePrice) {
      return res.status(400).json({ message: "Invalid symbol" });
    }

    const newStock = new Stock({
      name: symbol,
      quantity,
      buyPrice: livePrice,
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
   🔄 REFRESH PRICES (Manual Button)
=========================== */

exports.refreshPrices = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });

    for (let stock of stocks) {
      try {
        const livePrice = await getLivePrice(stock.name);

        if (livePrice && !isNaN(livePrice)) {
          stock.currentPrice = livePrice;
          await stock.save();
        } else {
          console.log("Invalid price for:", stock.name);
        }

        // prevent rate limit
        await new Promise(resolve => setTimeout(resolve, 1200));

      } catch (err) {
        console.log("Error updating:", stock.name);
      }
    }

    return res.status(200).json({
      message: "Prices updated successfully"
    });

  } catch (error) {
    console.log("Refresh crashed:", error);
    return res.status(500).json({
      message: "Error refreshing prices"
    });
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
   💰 SELL STOCK
=========================== */

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

exports.getSummary = async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });

    let totalInvestment = 0;
    let totalPortfolioValue = 0;

    stocks.forEach(stock => {
      totalInvestment += stock.buyPrice * stock.quantity;
      totalPortfolioValue += stock.currentPrice * stock.quantity;
    });

    const totalProfitLoss = totalPortfolioValue - totalInvestment;

    res.json({
      totalInvestment,
      totalPortfolioValue,
      totalProfitLoss,
      totalStocks: stocks.length
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating summary" });
  }
};