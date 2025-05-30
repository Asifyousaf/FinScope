// Dashboard JavaScript - Handles all dashboard functionality with real API data
import { 
  getMarketIndices,
  getMajorStocks,
  getMajorCrypto,
  getMarketMovers
} from './api.js';

// Wait for the page to fully load before initializing dashboard
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard loading started...');
  
  // Initialize all dashboard sections with proper error handling
  initializeLoadingStates();
  await Promise.all([
    initializeMarketOverview(),
    initializeWatchlist(),
    initializeCryptoTracker(),
    initializeTopMovers()
  ]);
  updateDateTime();
  
  // Set up refresh button functionality
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      this.classList.add('animate-spin');
      await refreshDashboardData();
      setTimeout(() => {
        this.classList.remove('animate-spin');
        showToast('Dashboard data refreshed successfully!');
      }, 1000);
    });
  }
});

function initializeLoadingStates() {
  const sections = ['market-overview', 'watchlist', 'crypto-tracker', 'top-gainers', 'top-losers'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = `
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      `;
    }
  });
}

async function initializeMarketOverview() {
  const marketOverviewElement = document.getElementById('market-overview');
  if (!marketOverviewElement) return;
  
  try {
    const indices = await getMarketIndices();
    
    if (!indices || indices.length === 0) {
      throw new Error('No market indices data available');
    }
    
    let html = '';
    indices.forEach(index => {
      const changeClass = index.change >= 0 ? 'text-neon-green' : 'text-red-500';
      const changeIcon = index.change >= 0 ? '▲' : '▼';
      
      html += `
        <div class="glass glass-hover rounded-lg p-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gold-400">${index.symbol}</h3>
              <span class="text-sm text-gray-400">${index.name || index.symbol}</span>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold">$${index.price.toFixed(2)}</div>
              <div class="flex items-center ${changeClass}">
                ${changeIcon} ${Math.abs(index.change).toFixed(2)} (${index.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    marketOverviewElement.innerHTML = html;
  } catch (error) {
    console.error('Market overview error:', error);
    marketOverviewElement.innerHTML = `
      <div class="col-span-full glass rounded-lg p-4 text-center">
        <p class="text-red-400">Unable to load market data</p>
        <button onclick="location.reload()" class="mt-2 text-gold-400 hover:text-gold-300">
          Try Again
        </button>
      </div>
    `;
  }
}

async function initializeWatchlist() {
  const watchlistElement = document.getElementById('watchlist');
  if (!watchlistElement) return;
  
  try {
    const stocks = await getMajorStocks();
    
    if (!stocks || stocks.length === 0) {
      throw new Error('No stocks data available');
    }
    
    let html = '';
    stocks.forEach(stock => {
      const changeClass = stock.change >= 0 ? 'text-neon-green' : 'text-red-500';
      const changeIcon = stock.change >= 0 ? '▲' : '▼';
      
      html += `
        <div class="glass glass-hover rounded-lg p-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gold-400">${stock.symbol}</h3>
              <span class="text-sm text-gray-400">${stock.name || stock.symbol}</span>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold">$${stock.price.toFixed(2)}</div>
              <div class="flex items-center ${changeClass}">
                ${changeIcon} ${Math.abs(stock.change).toFixed(2)} (${stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    watchlistElement.innerHTML = html;
  } catch (error) {
    console.error('Watchlist error:', error);
    watchlistElement.innerHTML = `
      <div class="col-span-full glass rounded-lg p-4 text-center">
        <p class="text-red-400">Unable to load watchlist data</p>
        <button onclick="location.reload()" class="mt-2 text-gold-400 hover:text-gold-300">
          Try Again
        </button>
      </div>
    `;
  }
}

async function initializeCryptoTracker() {
  const cryptoTrackerElement = document.getElementById('crypto-tracker');
  if (!cryptoTrackerElement) return;
  
  try {
    const cryptos = await getMajorCrypto();
    
    if (!cryptos || cryptos.length === 0) {
      throw new Error('No cryptocurrency data available');
    }
    
    let html = '';
    cryptos.forEach(crypto => {
      const changeClass = crypto.change >= 0 ? 'text-neon-green' : 'text-red-500';
      const changeIcon = crypto.change >= 0 ? '▲' : '▼';
      
      html += `
        <div class="glass glass-hover rounded-lg p-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gold-400">${crypto.symbol}</h3>
              <span class="text-sm text-gray-400">${crypto.name}</span>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold">$${crypto.price.toFixed(2)}</div>
              <div class="flex items-center ${changeClass}">
                ${changeIcon} ${Math.abs(crypto.change).toFixed(2)}%
              </div>
              <div class="text-sm text-gray-400">
                Vol: ${formatVolume(crypto.volume)}
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    cryptoTrackerElement.innerHTML = html;
  } catch (error) {
    console.error('Crypto tracker error:', error);
    cryptoTrackerElement.innerHTML = `
      <div class="col-span-full glass rounded-lg p-4 text-center">
        <p class="text-red-400">Unable to load cryptocurrency data</p>
        <button onclick="location.reload()" class="mt-2 text-gold-400 hover:text-gold-300">
          Try Again
        </button>
      </div>
    `;
  }
}

async function initializeTopMovers() {
  const gainersElement = document.getElementById('top-gainers');
  const losersElement = document.getElementById('top-losers');
  if (!gainersElement || !losersElement) return;
  
  try {
    const movers = await getMarketMovers();
    
    if (!movers || (!movers.gainers && !movers.losers)) {
      throw new Error('No market movers data available');
    }
    
    // Render gainers
    let gainersHtml = '';
    movers.gainers.forEach(stock => {
      gainersHtml += `
        <div class="glass glass-hover rounded-lg p-3">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gold-400">${stock.symbol}</span>
            <div class="text-right">
              <div class="text-neon-green">
                ▲ ${stock.changePercent.toFixed(2)}%
              </div>
              <div class="text-sm text-gray-400">
                $${stock.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      `;
    });
    gainersElement.innerHTML = gainersHtml;
    
    // Render losers
    let losersHtml = '';
    movers.losers.forEach(stock => {
      losersHtml += `
        <div class="glass glass-hover rounded-lg p-3">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gold-400">${stock.symbol}</span>
            <div class="text-right">
              <div class="text-red-500">
                ▼ ${Math.abs(stock.changePercent).toFixed(2)}%
              </div>
              <div class="text-sm text-gray-400">
                $${stock.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      `;
    });
    losersElement.innerHTML = losersHtml;
  } catch (error) {
    console.error('Top movers error:', error);
    const errorHtml = `
      <div class="glass rounded-lg p-4 text-center">
        <p class="text-red-400">Unable to load market movers</p>
        <button onclick="location.reload()" class="mt-2 text-gold-400 hover:text-gold-300">
          Try Again
        </button>
      </div>
    `;
    gainersElement.innerHTML = errorHtml;
    losersElement.innerHTML = errorHtml;
  }
}

function updateDateTime() {
  const dateTimeElement = document.getElementById('current-datetime');
  if (!dateTimeElement) return;
  
  const updateTime = () => {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString('en-US', {
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
  
  updateTime();
  setInterval(updateTime, 1000);
}

async function refreshDashboardData() {
  try {
    initializeLoadingStates();
    await Promise.all([
      initializeMarketOverview(),
      initializeWatchlist(),
      initializeCryptoTracker(),
      initializeTopMovers()
    ]);
    return true;
  } catch (error) {
    console.error('Dashboard refresh error:', error);
    showToast('Failed to refresh dashboard data', 'error');
    return false;
  }
}

function formatVolume(volume) {
  if (!volume) return '$0';
  
  if (volume >= 1e12) return `$${(volume / 1e12).toFixed(1)}T`;
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  if (type === 'error') {
    toast.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    toast.style.color = '#ef4444';
  } else {
    toast.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    toast.style.color = '#f59e0b';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}