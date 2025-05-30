// trends.js - Updated to use only Alpha Vantage API
const ALPHA_VANTAGE_API_KEY = 'Q1J2GM7L9WMRDS9A';

// Initialize all features on DOM load
document.addEventListener('DOMContentLoaded', function () {
  loadMarketTrends();
  setupStockComparison();
  setupCryptoChart();
  setupStockSearch();
});

// Load Market Trends using Alpha Vantage API
async function loadMarketTrends() {
  const marketTrendsContainer = document.getElementById('market-trends');
  if (!marketTrendsContainer) return;

  const symbols = ['SPY', 'DIA', 'QQQ'];

  try {
    const results = await Promise.all(
      symbols.map(symbol =>
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
          .then(res => res.json())
      )
    );

    let html = '';
    results.forEach((data, index) => {
      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent']);

      const isPositive = change >= 0;
      const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
      const changeIcon = isPositive ? '▲' : '▼';

      html += `
        <div class="glass rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gold-400 mb-2">${symbols[index]}</h3>
          <div class="text-2xl font-bold text-white mb-1">$${price.toFixed(2)}</div>
          <div class="${changeColor}">${changeIcon} ${change.toFixed(2)} (${changePercent.toFixed(2)}%)</div>
        </div>
      `;
    });

    marketTrendsContainer.innerHTML = html;
  } catch (err) {
    console.error('Failed to fetch market data:', err);
    showToast('Failed to load market trends', 'error');
  }
}

// Stock Search with Alpha Vantage
function setupStockSearch() {
  const form = document.getElementById('stock-search-form');
  const input = document.getElementById('stock-search-input');
  const resultsSection = document.getElementById('stock-lookup-section');
  const resultsContainer = document.getElementById('stock-results');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) return showToast('Please enter a stock symbol', 'error');

    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
      const data = await res.json();
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        return showToast(`No data found for ${symbol}`, 'error');
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const volume = parseInt(quote['06. volume']);

      const isPositive = change >= 0;
      const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
      const changeIcon = isPositive ? '▲' : '▼';

      resultsContainer.innerHTML = `
        <div class="glass rounded-lg p-6">
          <h3 class="text-2xl font-semibold text-gold-400 mb-2">${symbol}</h3>
          <p class="text-gray-300 mb-4">Real-time stock quote</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p class="text-gray-400">Price</p><p class="text-2xl font-bold text-white">$${price.toFixed(2)}</p></div>
            <div><p class="text-gray-400">Change</p><p class="text-lg font-semibold ${changeColor}">${changeIcon} $${Math.abs(change).toFixed(2)}</p></div>
            <div><p class="text-gray-400">Volume</p><p class="text-lg text-white">${volume.toLocaleString()}</p></div>
          </div>
        </div>
      `;

      resultsSection.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      showToast('Error fetching stock data', 'error');
    }
  });
}

// Placeholder functions - You can later update these to use real Alpha Vantage time series data
function setupStockComparison() {
  console.log('Stock comparison placeholder loaded');
}

function setupCryptoChart() {
  console.log('Crypto chart placeholder loaded');
}

// Toast Utility
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
