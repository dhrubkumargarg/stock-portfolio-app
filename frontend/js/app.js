const API_BASE = "http://localhost:5000/api";
let editingStockId = null;

/* ===========================
   🔐 AUTH SECTION
=========================== */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem("token", data.token);
    showPortfolio();
  } else {
    alert(data.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function showPortfolio() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("portfolioSection").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-block";
  fetchStocks();
}

window.onload = () => {
  const token = localStorage.getItem("token");
  if (token) {
    showPortfolio();
  }
};

/* ===========================
   🌐 CENTRALIZED API HELPER
=========================== */

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // 🔐 Auto logout if token expired
  if (response.status === 401) {
    alert("Session expired. Please login again.");
    logout();
    return;
  }

  return response;
}

/* ===========================
   📊 STOCK SECTION
=========================== */

async function fetchStocks() {
  const response = await apiRequest("/stocks");
  if (!response) return;

  const stocks = await response.json();

  const table = document.getElementById("stockTable");
  table.innerHTML = "";

  stocks.forEach(stock => {
    const profitLoss = (stock.currentPrice - stock.buyPrice) * stock.quantity;

    const row = `
      <tr>
        <td>${stock.name}</td>
        <td>${stock.quantity.toLocaleString()}</td>
        <td>₹${stock.buyPrice.toLocaleString()}</td>
        <td>₹${stock.currentPrice.toLocaleString()}</td>
        <td style="color:${profitLoss >= 0 ? 'green' : 'red'}">
          ₹${profitLoss.toLocaleString()}
        </td>
        <td>
          <button onclick="editStock('${stock._id}', '${stock.name}', ${stock.quantity}, ${stock.buyPrice}, ${stock.currentPrice})"
            class="btn btn-warning btn-sm">Edit</button>
          <button onclick="deleteStock('${stock._id}')"
            class="btn btn-danger btn-sm">Delete</button>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });

  fetchSummary();
}

async function addStock() {
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;

  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const currentPrice = parseFloat(document.getElementById("currentPrice").value);

  if (!name || quantity <= 0 || buyPrice <= 0 || currentPrice <= 0) {
    alert("Please enter valid values");
    btn.disabled = false;
    return;
  }

  const payload = { name, quantity, buyPrice, currentPrice };

  if (editingStockId) {
    await apiRequest(`/stocks/${editingStockId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    editingStockId = null;
    btn.innerText = "Add Stock";
  } else {
    await apiRequest("/stocks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  clearForm();
  fetchStocks();
  btn.disabled = false;
}

async function deleteStock(id) {
  await apiRequest(`/stocks/${id}`, {
    method: "DELETE"
  });

  fetchStocks();
}

function editStock(id, name, quantity, buyPrice, currentPrice) {
  editingStockId = id;

  document.getElementById("name").value = name;
  document.getElementById("quantity").value = quantity;
  document.getElementById("buyPrice").value = buyPrice;
  document.getElementById("currentPrice").value = currentPrice;

  document.getElementById("submitBtn").innerText = "Update Stock";
}

async function fetchSummary() {
  const response = await apiRequest("/stocks/summary");
  if (!response) return;

  const summary = await response.json();

  document.getElementById("totalInvestment").innerText =
    summary.totalInvestment.toLocaleString();

  document.getElementById("totalPortfolioValue").innerText =
    summary.totalPortfolioValue.toLocaleString();

  document.getElementById("totalProfitLoss").innerText =
    summary.totalProfitLoss.toLocaleString();

  document.getElementById("totalStocks").innerText =
    summary.totalStocks;

  document.getElementById("totalQuantity").innerText =
    summary.totalQuantity.toLocaleString();
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("buyPrice").value = "";
  document.getElementById("currentPrice").value = "";
}