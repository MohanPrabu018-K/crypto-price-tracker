const coinsContainer = document.getElementById("coinsContainer");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("coinModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.querySelector(".close");

let coinsData = [];

async function fetchCoins() {
  try {
    const res = await fetch("http://127.0.0.1:5000/get_top_coins");
    const data = await res.json();

    if (Array.isArray(data)) {
      updateUI(data);
    } else {
      console.error("Invalid data format:", data);
    }
  } catch (error) {
    console.error("Error fetching coins:", error);
  }
}

function updateUI(data) {
  const filtered = data.filter(coin =>
    coin.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  filtered.forEach((coin, index) => {
    const existingCard = document.getElementById(coin.id);

    if (existingCard) {
      const oldPrice = parseFloat(existingCard.getAttribute("data-price"));
      const newPrice = coin.price;

      if (newPrice > oldPrice) {
        existingCard.classList.add("green-flash");
        setTimeout(() => existingCard.classList.remove("green-flash"), 500);
      } else if (newPrice < oldPrice) {
        existingCard.classList.add("red-flash");
        setTimeout(() => existingCard.classList.remove("red-flash"), 500);
      }

      existingCard.setAttribute("data-price", newPrice);
      existingCard.querySelector(".coin-price").innerHTML = `$${newPrice.toFixed(2)}`;
    } else {
      const card = document.createElement("div");
      card.classList.add("coin-card");
      card.id = coin.id;
      card.setAttribute("data-price", coin.price);

      card.innerHTML = `
        <div class="coin-header">
          <img src="${coin.image}" alt="${coin.name}">
          <h3>${coin.name} (${coin.symbol})</h3>
        </div>
        <div class="coin-price">$${coin.price.toFixed(2)}</div>
        <div class="coin-change" style="color: ${coin.change >= 0 ? 'lime' : 'red'};">
          ${coin.change ? coin.change.toFixed(2) : 0}%
        </div>
      `;

      card.addEventListener("click", () => showCoinModal(coin));
      coinsContainer.appendChild(card);
    }
  });
}

function showCoinModal(coin) {
  modal.style.display = "block";
  modalBody.innerHTML = `
    <div style="text-align:center;">
      <img src="${coin.image}" alt="${coin.name}">
      <h2>${coin.name} (${coin.symbol})</h2>
    </div>
    <p><b>Price:</b> $${coin.price.toFixed(2)}</p>
    <p><b>Market Cap:</b> $${coin.market_cap.toLocaleString()}</p>
    <p><b>24h High:</b> $${coin.high_24h}</p>
    <p><b>24h Low:</b> $${coin.low_24h}</p>
    <p><b>24h Change:</b> ${coin.change ? coin.change.toFixed(2) : 0}%</p>
    <p><b>Circulating Supply:</b> ${coin.circulating_supply.toLocaleString()}</p>
  `;
}

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
searchInput.addEventListener("input", () => updateUI(coinsData));

setInterval(fetchCoins, 3000);
fetchCoins();
