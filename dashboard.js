// Pulling in all our API helpers (these give us market data, crypto prices, etc.)
import {
  getMarketIndices,
  getMajorStocks,
  getMajorCrypto
} from './api.js';

// Once the page is fully loaded, run this stuff
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData(); // grab all initial data
  updateDateTime(); // start showing the clock

  // Set up refresh button (if it exists)
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('animate-spin'); // add spinning animation
      await loadDashboardData(); // reload everything
      setTimeout(() => {
        refreshBtn.classList.remove('animate-spin'); // stop the spin
        showToast('Dashboard data refreshed successfully!'); // show message
      }, 1000); // delay is just for smoother UI
    });
  }
});

// Loads everything: stocks, crypto, and market indices
async function loadDashboardData() {
  await Promise.all([
    renderMarketOverview(),
    renderWatchlist(),
    renderCryptoTracker()
  ]);
}

// Updates the time every second – useful for a dashboard vibe
function updateDateTime() {
  const el = document.getElementById('current-datetime');
  if (!el) return; // bail out if the element is missing

  const update = () => {
    el.textContent = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  update(); // run once immediately
  setInterval(update, 1000); // then every second
}

// Loads market indices and displays them
async function renderMarketOverview() {
  const el = document.getElementById('market-overview');
  if (!el) return;
  el.innerHTML = loadingSpinner(); // show loading

  try {
    const data = await getMarketIndices(); // fetch data
    el.innerHTML = data.map(renderCard).join(''); // render all cards
  } catch (err) {
    console.error('Market overview error:', err);
    el.innerHTML = errorMessage('market data'); // show error message
  }
}

// Shows top stock list (like a watchlist)
async function renderWatchlist() {
  const el = document.getElementById('watchlist');
  if (!el) return;
  el.innerHTML = loadingSpinner();

  try {
    const data = await getMajorStocks();
    el.innerHTML = data.map(renderCard).join('');
  } catch (err) {
    console.error('Watchlist error:', err);
    el.innerHTML = errorMessage('stock data');
  }
}

// Shows crypto prices — looks a bit different from stock/market cards
async function renderCryptoTracker() {
  const el = document.getElementById('crypto-tracker');
  if (!el) return;
  el.innerHTML = loadingSpinner();

  try {
    const data = await getMajorCrypto();
    el.innerHTML = data.map(crypto => `
      <div class="glass glass-hover rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gold-400">${crypto.symbol}</h3>
            <span class="text-sm text-gray-400">${crypto.name}</span>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold">${formatCurrency(crypto.price)}</div>
            <div class="text-sm text-gray-400">Vol: ${formatVolume(crypto.volume)}</div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Crypto tracker error:', err);
    el.innerHTML = errorMessage('crypto data');
  }
}

// Creates a card 

function renderCard(item) {
  const isUp = item.change >= 0;
  const icon = isUp
    ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7 7 7M12 3v18"/>
       </svg>`
    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7-7-7M12 21V3"/>
       </svg>`;

  return `
    <div class="glass glass-hover rounded-lg p-4">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-semibold text-gold-400">${item.symbol}</h3>
          <span class="text-sm text-gray-400">${new Date().toISOString().split('T')[0]}</span>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold">${formatCurrency(item.price)}</div>
          <div class="flex items-center ${isUp ? 'text-neon-green' : 'text-red-500'}">
            ${icon}
            <span class="ml-1">${Math.abs(item.change).toFixed(2)} (${Math.abs(item.changesPercentage || item.changePercent || 0).toFixed(2)}%)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Basic spinner for loading states 
function loadingSpinner() {
  return `
    <div class="flex justify-center items-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
    </div>
  `;
}

// Shows a reusable error block when data fails to load
function errorMessage(type) {
  return `
    <div class="text-center text-red-500">
      Failed to load ${type}. <br/>
      <button onclick="location.reload()" class="mt-2 text-gold-400 hover:text-gold-300 underline">
        Try Again
      </button>
    </div>
  `;
}

// Converts numbers to $ format 
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Takes a big volume number and shortens it
function formatVolume(vol) {
  if (vol >= 1e12) return (vol / 1e12).toFixed(1) + 'T';
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toLocaleString(); // fallback
}

// Little toast notification at the bottom 
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const messageBox = document.getElementById('toast-message');
  if (!toast || !messageBox) return;

  messageBox.textContent = message;
  toast.classList.add('show');

  toast.style.color = type === 'error' ? '#ef4444' : '#f59e0b';
  toast.style.borderColor = type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // hide after 3 secs
}
