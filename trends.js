// Trends page JavaScript with real FMP API data
import {
  getMarketIndices,
  fetchStockTimeSeries,
  getMajorCrypto,
  fetchCryptoTimeSeries,
  fetchStockData
} from './api.js';

let marketChart = null;
let cryptoChart = null;

// Initialize the page when DOM is fully loaded
window.addEventListener('DOMContentLoaded', async () => {
  await renderMarketTrends();      // Display market indices
  setupStockComparison();         // Set up stock comparison chart
  setupCryptoChart();             // Set up crypto chart
  setupStockSearch();             // Enable stock symbol search
});

// Render stock market indices 
async function renderMarketTrends() {
  const container = document.getElementById('market-trends');
  if (!container) return;

  try {
    const indices = await getMarketIndices(); // Fetch market index data
    let html = '';

    indices.forEach(item => {
      const changeClass = item.change >= 0 ? 'text-neon-green' : 'text-red-500';
      const icon = item.change >= 0 ? '▲' : '▼';
      const changePercent = item.changePercent ?? 0; // Fallback for missing data

      // Generate HTML for each market index
      html += `
        <div class="glass rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gold-400 mb-2">${item.symbol}</h3>
          <div class="text-2xl font-bold text-white mb-1">$${item.price.toFixed(2)}</div>
          <div class="${changeClass}">
            ${icon} ${item.change.toFixed(2)} (${changePercent.toFixed(2)}%)
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error('Error in renderMarketTrends:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load market trends</p>';
  }
}

// Setup the stock comparison chart and button events
function setupStockComparison() {
  const buttons = document.querySelectorAll('.stock-selector');
  const canvas = document.getElementById('stock-comparison-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Initialize Chart.js line chart
  marketChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#f59e0b' } } },
      scales: {
        x: { ticks: { color: '#f59e0b' } },
        y: { ticks: { color: '#f59e0b' } }
      }
    }
  });

  // Add click event to each stock button
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const symbol = button.dataset.symbol;
      await updateStockChart(symbol);
    });
  });

  // Load default stock chart
  updateStockChart('AAPL');
}

// Update stock comparison chart for selected symbol
async function updateStockChart(symbol) {
  try {
    const data = await fetchStockTimeSeries(symbol); // Fetch time series data
    const labels = data.map(d => d.date);
    const values = data.map(d => d.price);

    marketChart.data.labels = labels;
    marketChart.data.datasets = [{
      label: symbol,
      data: values,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: true
    }];

    marketChart.update();
  } catch (err) {
    console.error('Stock chart update failed', err);
  }
}

// Setup crypto chart and period selector buttons
function setupCryptoChart() {
  const canvas = document.getElementById('crypto-chart');
  const buttons = document.querySelectorAll('.time-selector');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Initialize Chart.js crypto chart
  cryptoChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#f59e0b' } } },
      scales: {
        x: { ticks: { color: '#f59e0b' } },
        y: { ticks: { color: '#f59e0b', callback: v => `$${v}` } }
      }
    }
  });

  // Attach event listeners to time range buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const period = btn.dataset.period;
      await updateCryptoChart(period);
    });
  });

  // Load default period
  updateCryptoChart('1m');
}

// Update crypto chart with selected time period data
async function updateCryptoChart(period) {
  try {
    const data = await fetchCryptoTimeSeries('BTCUSD', period);
    const labels = data.map(p => p.date);
    const values = data.map(p => p.price);

    cryptoChart.data.labels = labels;
    cryptoChart.data.datasets = [{
      label: 'BTCUSD',
      data: values,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: true
    }];

    cryptoChart.update();
  } catch (err) {
    console.error('Crypto chart update failed', err);
  }
}

// Setup stock search form for manual symbol lookup
function setupStockSearch() {
  const form = document.getElementById('stock-search-form');
  const input = document.getElementById('stock-search-input');
  const results = document.getElementById('stock-results');
  const section = document.getElementById('stock-lookup-section');
  if (!form) return;

  // Handle stock search form submission
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) return;

    try {
      const data = await fetchStockData(symbol); // Get stock info by symbol
      const changeClass = data.change >= 0 ? 'text-neon-green' : 'text-red-500';
      const icon = data.change >= 0 ? '▲' : '▼';

      // Display stock data in results section
      results.innerHTML = `
        <div class="glass rounded-lg p-6">
          <h3 class="text-2xl font-semibold text-gold-400 mb-2">${data.symbol}</h3>
          <p class="text-gray-300 mb-4">${data.name}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-gray-400">Price</p>
              <p class="text-2xl font-bold text-white">$${data.price.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-gray-400">Change</p>
              <p class="text-lg font-semibold ${changeClass}">${icon} ${data.change.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-gray-400">Volume</p>
              <p class="text-lg text-white">${data.volume.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;

      section.classList.remove('hidden');
    } catch (err) {
      results.innerHTML = '<p class="text-red-500">Stock not found.</p>';
    }
  });
}
