
import { 
  fetchStockData,
  getMarketIndices,
  getMajorStocks,
  getMajorCrypto
} from './api.js';

// Fallback data for when API calls fail
const fallbackMarketData = [
  { symbol: 'SPY', price: 501.24, change: 1.53, changePercent: 0.31, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'QQQ', price: 378.45, change: -2.15, changePercent: -0.56, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'DIA', price: 390.82, change: 0.75, changePercent: 0.19, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'IWM', price: 218.93, change: -0.42, changePercent: -0.19, latestTradingDay: new Date().toISOString().split('T')[0] }
];

const fallbackStockData = [
  { symbol: 'AAPL', price: 189.25, change: 2.18, changePercent: 1.17, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'MSFT', price: 415.67, change: -1.23, changePercent: -0.29, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'GOOGL', price: 172.48, change: 3.45, changePercent: 2.04, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'AMZN', price: 181.92, change: -0.87, changePercent: -0.47, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'META', price: 524.31, change: 4.76, changePercent: 0.92, latestTradingDay: new Date().toISOString().split('T')[0] },
  { symbol: 'TSLA', price: 183.54, change: -2.34, changePercent: -1.26, latestTradingDay: new Date().toISOString().split('T')[0] }
];

const fallbackCryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67420.50, volume: 28450000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3890.75, volume: 15230000000 },
  { symbol: 'LTC', name: 'Litecoin', price: 95.42, volume: 580000000 },
  { symbol: 'XRP', name: 'Ripple', price: 0.5234, volume: 1200000000 },
  { symbol: 'ADA', name: 'Cardano', price: 0.4567, volume: 890000000 }
];

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize dashboard elements with real or fallback data
  await initializeMarketOverview();
  await initializeWatchlist();
  await initializeCryptoTracker();
  updateDateTime();
  
  // Set up refresh button
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

// Update date and time
function updateDateTime() {
  const dateTimeElement = document.getElementById('current-datetime');
  if (dateTimeElement) {
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
    
    updateTime(); // Update immediately
    setInterval(updateTime, 1000);
  }
}

// Initialize market overview section with real or fallback data
async function initializeMarketOverview() {
  const marketOverviewElement = document.getElementById('market-overview');
  if (!marketOverviewElement) return;
  
  try {
    // Show loading state
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading market data...</div>';
    
    let marketIndices;
    try {
      marketIndices = await getMarketIndices();
    } catch (error) {
      console.log('Using fallback market data due to API error:', error);
      marketIndices = fallbackMarketData;
    }
    
    let marketOverviewHTML = '';
    marketIndices.forEach(index => {
      if (index) {
        const changeClass = index.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = index.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
        marketOverviewHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${index.symbol}</h3>
                <span class="text-sm text-gray-400">${index.latestTradingDay}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(index.price, 'USD')}</div>
                <div class="flex items-center ${changeClass}">
                  ${changeIcon}
                  <span class="ml-1">${index.change.toFixed(2)} (${index.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    marketOverviewElement.innerHTML = marketOverviewHTML;
  } catch (error) {
    console.error('Error initializing market overview:', error);
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load market data</div>';
  }
}

// Initialize watchlist section with real or fallback data
async function initializeWatchlist() {
  const watchlistElement = document.getElementById('watchlist');
  if (!watchlistElement) return;
  
  try {
    // Show loading state
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading stock data...</div>';
    
    let stocks;
    try {
      stocks = await getMajorStocks();
    } catch (error) {
      console.log('Using fallback stock data due to API error:', error);
      stocks = fallbackStockData;
    }
    
    let watchlistHTML = '';
    stocks.forEach(stock => {
      if (stock) {
        const changeClass = stock.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = stock.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
        watchlistHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${stock.symbol}</h3>
                <span class="text-sm text-gray-400">${stock.latestTradingDay}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(stock.price, 'USD')}</div>
                <div class="flex items-center ${changeClass}">
                  ${changeIcon}
                  <span class="ml-1">${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    watchlistElement.innerHTML = watchlistHTML;
  } catch (error) {
    console.error('Error initializing watchlist:', error);
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load stock data</div>';
  }
}

// Initialize crypto tracker section with real or fallback data
async function initializeCryptoTracker() {
  const cryptoTrackerElement = document.getElementById('crypto-tracker');
  if (!cryptoTrackerElement) return;
  
  try {
    // Show loading state
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading crypto data...</div>';
    
    let cryptos;
    try {
      cryptos = await getMajorCrypto();
    } catch (error) {
      console.log('Using fallback crypto data due to API error:', error);
      cryptos = fallbackCryptoData;
    }
    
    let cryptoHTML = '';
    cryptos.forEach(crypto => {
      if (crypto) {
        cryptoHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${crypto.symbol}</h3>
                <span class="text-sm text-gray-400">${crypto.name}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(crypto.price, 'USD')}</div>
                <div class="text-sm text-gray-400">Vol: ${crypto.volume.toLocaleString()}</div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    cryptoTrackerElement.innerHTML = cryptoHTML;
  } catch (error) {
    console.error('Error initializing crypto tracker:', error);
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load crypto data</div>';
  }
}

// Refresh all dashboard data
async function refreshDashboardData() {
  try {
    await initializeMarketOverview();
    await initializeWatchlist();
    await initializeCryptoTracker();
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    showToast('Failed to refresh dashboard data. Please try again.', 'error');
    return false;
  }
}

// Currency formatting function
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Toast notification function
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
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
}
