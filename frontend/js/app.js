const API_URL = "http://localhost:5000/api/stocks";

let editingStockId = null;

// Load stocks on page load
window.onload = fetchStocks;

// 🔹 Fetch all stocks
async function fetchStocks() {
  const response = await fetch(API_URL);
  const stocks = await response.json();

  const table = document.getElementById("stockTable");
  table.innerHTML = "";

  stocks.forEach(stock => {

    const profitLoss = (stock.currentPrice - stock.buyPrice) * stock.quantity;

    const row = `
      <tr>
        <td>${stock.name}</td>
        <td>${stock.quantity}</td>
        <td>${stock.buyPrice}</td>
        <td>${stock.currentPrice}</td>
        <td style="color:${profitLoss >= 0 ? 'green' : 'red'}">
          ${profitLoss}
        </td>
        <td>
          <button onclick="editStock('${stock._id}', '${stock.name}', ${stock.quantity}, ${stock.buyPrice}, ${stock.currentPrice})" 
            class="btn btn-warning btn-sm">
            Edit
          </button>
          <button onclick="deleteStock('${stock._id}')" 
            class="btn btn-danger btn-sm">
            Delete
          </button>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });

  fetchSummary();
}

// 🔹 Add or Update Stock
async function addStock() {
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const currentPrice = parseFloat(document.getElementById("currentPrice").value);

  // Validation
  if (!name) {
    alert("Stock name is required");
    return;
  }

  if (isNaN(quantity) || quantity <= 0) {
    alert("Quantity must be positive");
    return;
  }

  if (isNaN(buyPrice) || buyPrice <= 0) {
    alert("Buy price must be positive");
    return;
  }

  if (isNaN(currentPrice) || currentPrice <= 0) {
    alert("Current price must be positive");
    return;
  }

  if (editingStockId) {
    // UPDATE
    await fetch(`${API_URL}/${editingStockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, buyPrice, currentPrice })
    });

    editingStockId = null;
    document.getElementById("submitBtn").innerText = "Add Stock";

  } else {
    // ADD
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, buyPrice, currentPrice })
    });
  }

  clearForm();
  fetchStocks();
}

// 🔹 Delete stock
async function deleteStock(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  fetchStocks();
}

// 🔹 Edit stock
function editStock(id, name, quantity, buyPrice, currentPrice) {
  editingStockId = id;

  document.getElementById("name").value = name;
  document.getElementById("quantity").value = quantity;
  document.getElementById("buyPrice").value = buyPrice;
  document.getElementById("currentPrice").value = currentPrice;

  document.getElementById("submitBtn").innerText = "Update Stock";
}

// 🔹 Fetch Portfolio Summary
async function fetchSummary() {
  const response = await fetch(`${API_URL}/summary`);
  const summary = await response.json();

  document.getElementById("totalInvestment").innerText = summary.totalInvestment;
  document.getElementById("totalPortfolioValue").innerText = summary.totalPortfolioValue;
  document.getElementById("totalProfitLoss").innerText = summary.totalProfitLoss;
  document.getElementById("totalStocks").innerText = summary.totalStocks;
  document.getElementById("totalQuantity").innerText = summary.totalQuantity;
}

// 🔹 Clear form
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("buyPrice").value = "";
  document.getElementById("currentPrice").value = "";
}
