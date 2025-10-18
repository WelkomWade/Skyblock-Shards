const API_URL = "https://api.hypixel.net/skyblock/bazaar";
const tableBody = document.getElementById("tableBody");
const table = document.getElementById("fragmentTable");
const loading = document.getElementById("loading");
const orderBtn = document.getElementById("orderMode");
const instantBtn = document.getElementById("instantMode");

let useInstant = false;

function humanize(code) {
  // remove prefixes and format nicely
  return code
    .replace(/_/g, " ")
    .replace("FRAGMENT", "Fragment")
    .split(" ")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

async function loadData() {
  loading.classList.remove("hidden");
  table.classList.add("hidden");
  tableBody.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const fragments = Object.entries(data.products)
      .filter(([id]) => id.includes("FRAGMENT"));

    const rows = fragments.map(([id, info]) => {
      const buy = useInstant
        ? info.sell_summary[0]?.pricePerUnit || 0   // instant buy = buy from sellers
        : info.buy_summary[0]?.pricePerUnit || 0;   // buy order = from buyers
      const sell = info.sell_summary[0]?.pricePerUnit || 0;
      const profit = (sell - buy).toFixed(2);
      const vol = info.quick_status.buyMovingWeek || 0;
      return { id, buy, sell, profit: parseFloat(profit), vol };
    });

    // sort by profit × volume (descending)
    rows.sort((a, b) => b.profit * b.vol - a.profit * a.vol);

    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${humanize(r.id)}</td>
        <td>${r.buy.toFixed(2)}</td>
        <td>${r.sell.toFixed(2)}</td>
        <td style="color:${r.profit > 0 ? '#3fb950' : '#f85149'}">${r.profit.toFixed(2)}</td>
        <td>${r.vol.toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (err) {
    loading.textContent = "Error loading data.";
    console.error(err);
  }
}

orderBtn.onclick = () => {
  useInstant = false;
  orderBtn.classList.add("active");
  instantBtn.classList.remove("active");
  loadData();
};

instantBtn.onclick = () => {
  useInstant = true;
  instantBtn.classList.add("active");
  orderBtn.classList.remove("active");
  loadData();
};

loadData();
