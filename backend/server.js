require("dotenv").config();   // Load environment variables

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");   // Import DB connection
const stockRoutes = require("./routes/stockRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Stock Portfolio Backend Running 🚀");
});

// Stock routes
app.use("/api/stocks", stockRoutes);
app.use("/api/auth", authRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  