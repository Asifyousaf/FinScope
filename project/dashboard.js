import { 
  fetchStockData, 
  fetchCryptoData,
  getTopMovers,
  mockStockData,
  mockCryptoData
} from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize dashboard elements
  initializeMarketOverview();
  initializeWatchlist();
  initializeCryptoTracker();
  await loadTopMovers();
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
    setInterval(() => {
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
    }, 1000);
  }
}

// Initialize market overview section
function initializeMarketOverview() {
  const marketOverviewElement = document.getElementById('market-overview');
  if (!marketOverviewElement) return;
  
  const marketIndices = [
    { symbol: 'SPY', name: 'S&P 500', price: 501.24, change: 1.53, changePercent: 0.31 },
    { symbol: 'DIA', name: 'Dow Jones', price: 384.67, change: 0.98, changePercent: 0.26 },
    { symbol: 'QQQ', name: 'NASDAQ', price: 427.82, change: 1.87, changePercent: 0.44 },
    { symbol: 'IWM', name: 'Russell 2000', price: 202.15, change: -0.87, changePercent: -0.43 }
  ];
  
  let marketOverviewHTML = '';
  marketIndices.forEach(index => {
    const changeClass = index.change >= 0 ? 'text-neon-green' : 'text-red-500';
    const changeIcon = index.change >= 0 ? 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
    
    marketOverviewHTML += `
      <div class="glass glass-hover rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gold-400">${index.name}</h3>
            <span class="text-sm text-gray-400">${index.symbol}</span>
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
  });
  
  marketOverviewElement.innerHTML = marketOverviewHTML;
}

// Initialize watchlist section
function initializeWatchlist() {
  const watchlistElement = document.getElementById('watchlist');
  if (!watchlistElement) return;
  
  let watchlistHTML = '';
  mockStockData.forEach(stock => {
    const changeClass = stock.change >= 0 ? 'text-neon-green' : 'text-red-500';
    const changeIcon = stock.change >= 0 ? 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
    
    watchlistHTML += `
      <div class="glass glass-hover rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gold-400">${stock.symbol}</h3>
            <span class="text-sm text-gray-400">${stock.name}</span>
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
  });
  
  watchlistElement.innerHTML = watchlistHTML;
}

// Initialize crypto tracker section
function initializeCryptoTracker() {
  const cryptoTrackerElement = document.getElementById('crypto-tracker');
  if (!cryptoTrackerElement) return;
  
  let cryptoHTML = '';
  mockCryptoData.forEach(crypto => {
    const changeClass = crypto.change >= 0 ? 'text-neon-green' : 'text-red-500';
    const changeIcon = crypto.change >= 0 ? 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
    
    cryptoHTML += `
      <div class="glass glass-hover rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gold-400">${crypto.symbol}</h3>
            <span class="text-sm text-gray-400">${crypto.name}</span>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold">${formatCurrency(crypto.price, 'USD')}</div>
            <div class="flex items-center ${changeClass}">
              ${changeIcon}
              <span class="ml-1">${crypto.change.toFixed(2)} (${crypto.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  cryptoTrackerElement.innerHTML = cryptoHTML;
}

// Load top movers (gainers and losers)
async function loadTopMovers() {
  const gainersElement = document.getElementById('top-gainers');
  const losersElement = document.getElementById('top-losers');
  
  if (!gainersElement || !losersElement) return;
  
  try {
    // For demo purposes, create mock data instead of API call to avoid rate limits
    // In production, use: const { gainers, losers } = await getTopMovers();
    
    const gainers = mockStockData.filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    
    const losers = mockStockData.filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
    
    // Render gainers
    let gainersHTML = '';
    gainers.forEach(stock => {
      gainersHTML += `
        <div class="glass glass-hover rounded-lg p-3">
          <div class="flex justify-between items-center">
            <div class="font-semibold text-gold-400">${stock.symbol}</div>
            <div class="text-neon-green flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              ${stock.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    });
    
    // Render losers
    let losersHTML = '';
    losers.forEach(stock => {
      losersHTML += `
        <div class="glass glass-hover rounded-lg p-3">
          <div class="flex justify-between items-center">
            <div class="font-semibold text-gold-400">${stock.symbol}</div>
            <div class="text-red-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              ${Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    });
    
    gainersElement.innerHTML = gainersHTML || '<p class="text-gray-400">No data available</p>';
    losersElement.innerHTML = losersHTML || '<p class="text-gray-400">No data available</p>';
    
  } catch (error) {
    console.error('Error loading top movers:', error);
    gainersElement.innerHTML = '<p class="text-red-500">Failed to load data</p>';
    losersElement.innerHTML = '<p class="text-red-500">Failed to load data</p>';
  }
}

// Refresh all dashboard data
async function refreshDashboardData() {
  try {
    initializeMarketOverview();
    initializeWatchlist();
    initializeCryptoTracker();
    await loadTopMovers();
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    showToast('Failed to refresh dashboard data. Please try again.', 'error');
    return false;
  }
}