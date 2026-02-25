const API_BASE = "https://stockwise-hzy4.onrender.com/api";

let allocationChart;
let profitChart;
let portfolioHistory = [];

/* ================= AUTH ================= */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
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
  if (token) showPortfolio();
};

/* ================= API HELPER ================= */

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    }
  });

  if (response.status === 401) {
    alert("Session expired. Login again.");
    logout();
    return;
  }

  return response;
}

/* ================= STOCKS ================= */

async function fetchStocks() {
  const response = await apiRequest("/stocks");
  if (!response) return;

  const stocks = await response.json();
  const table = document.getElementById("stockTable");
  table.innerHTML = "";

  let totalProfit = 0;

  stocks.forEach(stock => {
    const profitLoss =
      (stock.currentPrice - stock.buyPrice) * stock.quantity;

    totalProfit += profitLoss;

    table.innerHTML += `
      <tr>
        <td>${stock.name}</td>
        <td>${stock.quantity.toLocaleString()}</td>
        <td>₹${stock.buyPrice.toLocaleString()}</td>
        <td>₹${stock.currentPrice.toLocaleString()}</td>
        <td style="color:${profitLoss >= 0 ? '#16a34a' : '#dc2626'}">
          ₹${profitLoss.toLocaleString()}
        </td>
        <td>
          <button onclick="sellStock('${stock._id}', ${stock.quantity})"
            class="btn btn-warning btn-sm me-1">
            Sell
          </button>
          <button onclick="deleteStock('${stock._id}')"
            class="btn btn-danger btn-sm">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  const now = new Date().toLocaleTimeString();
  portfolioHistory.push({ time: now, profit: totalProfit });

  if (portfolioHistory.length > 15) {
    portfolioHistory.shift();
  }

  renderCharts(stocks);
  fetchSummary();
}

async function addStock() {
  const name = document.getElementById("name").value.trim().toUpperCase();
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!name || quantity <= 0) {
    alert("Invalid input");
    return;
  }

  const response = await apiRequest("/stocks", {
    method: "POST",
    body: JSON.stringify({ name, quantity })
  });

  if (response.ok) {
    clearForm();
    fetchStocks();
  } else {
    const data = await response.json();
    alert(data.message || "Failed to add stock");
  }
}

async function deleteStock(id) {
  await apiRequest(`/stocks/${id}`, { method: "DELETE" });
  fetchStocks();
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
}

/* ================= SELL ================= */

async function sellStock(id, maxQty) {
  const qty = parseInt(prompt(`Enter quantity to sell (Max: ${maxQty})`));

  if (!qty || qty <= 0 || qty > maxQty) {
    alert("Invalid quantity");
    return;
  }

  await apiRequest(`/stocks/sell/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity: qty })
  });

  fetchStocks();
}

/* ================= MANUAL REFRESH BUTTON ================= */

async function refreshPrices() {
  const response = await apiRequest("/stocks/refresh", {
    method: "PUT"
  });

  if (response.ok) {
    alert("Prices updated successfully!");
    fetchStocks();
  } else {
    alert("Failed to refresh prices");
  }
}

/* ================= SUMMARY ================= */

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

  const plElement = document.getElementById("plValue");

  if (summary.totalProfitLoss >= 0) {
    plElement.classList.remove("loss");
    plElement.classList.add("profit");
  } else {
    plElement.classList.remove("profit");
    plElement.classList.add("loss");
  }
}

/* ================= CHARTS ================= */

function renderCharts(stocks) {
  const names = stocks.map(s => s.name);
  const allocation = stocks.map(s => s.quantity * s.currentPrice);

  if (allocationChart) allocationChart.destroy();
  if (profitChart) profitChart.destroy();

  allocationChart = new Chart(
    document.getElementById("allocationChart"),
    {
      type: "pie",
      data: {
        labels: names,
        datasets: [{
          data: allocation
        }]
      }
    }
  );

  const labels = portfolioHistory.map(p => p.time);
  const profits = portfolioHistory.map(p => p.profit);

  const lastProfit = profits[profits.length - 1] || 0;
  const lineColor = lastProfit >= 0 ? "#16a34a" : "#dc2626";

  profitChart = new Chart(
    document.getElementById("profitChart"),
    {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          data: profits,
          borderColor: lineColor,
          backgroundColor: "transparent",
          tension: 0.3,
          pointBackgroundColor: lineColor,
          pointRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: value => "₹" + value
            }
          }
        }
      }
    }
  );
}

/* ================= GOOGLE LOGIN ================= */

function handleGoogleLogin(response) {
  fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: response.credential
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      showPortfolio();
    } else {
      alert("Google login failed");
    }
  })
  .catch(() => {
    alert("Google login failed");
  });
}