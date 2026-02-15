const API_URL = "http://localhost:5000/api/stocks";

// Load stocks when page loads
window.onload = fetchStocks;

async function fetchStocks() {
  const response = await fetch(API_URL);
  const stocks = await response.json();

  const table = document.getElementById("stockTable");
  table.innerHTML = "";

  stocks.forEach(stock => {
    const row = `
      <tr>
        <td>${stock.name}</td>
        <td>${stock.quantity}</td>
        <td>${stock.buyPrice}</td>
        <td>
          <button onclick="deleteStock('${stock._id}')" class="btn btn-danger btn-sm">
            Delete
          </button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
  fetchSummary();

}


async function addStock() {
  const name = document.getElementById("name").value;
  const quantity = document.getElementById("quantity").value;
  const buyPrice = document.getElementById("buyPrice").value;

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, quantity, buyPrice })
  });

  fetchStocks();

  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("buyPrice").value = "";
}

async function deleteStock(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  fetchStocks();
}
async function fetchSummary() {
  const response = await fetch(`${API_URL}/summary`);
  const summary = await response.json();

  document.getElementById("totalInvestment").innerText = summary.totalInvestment;
  document.getElementById("totalStocks").innerText = summary.totalStocks;
  document.getElementById("totalQuantity").innerText = summary.totalQuantity;
}
