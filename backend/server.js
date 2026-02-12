const express = require("express");
const cors = require("cors");

const stockRoutes = require("./routes/stockRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Stock Portfolio Backend Running 🚀");
});

app.use("/api/stocks", stockRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
