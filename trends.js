
import { 
  fetchStockData,
  fetchStockTimeSeries,
  getMajorCrypto,
  getMarketIndices,
  searchSymbol
} from './api.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Trends page loaded successfully');
  
  loadMarketTrends();
  setupStockComparison();
  setupCryptoChart();
  setupStockSearch();
});

async function loadMarketTrends() {
  const marketTrendsContainer = document.getElementById('market-trends');
  if (!marketTrendsContainer) {
    console.log('Market trends container not found');
    return;
  }
  
  try {
    marketTrendsContainer.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading market data...</div>';
    
    const marketData = await getMarketIndices();
    
    let html = '';
    marketData.forEach(item => {
      if (item) {
        const isPositive = item.change >= 0;
        const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
        const changeIcon = isPositive ? '▲' : '▼';
        
        html += `
          <div class="glass rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gold-400 mb-2">${item.symbol}</h3>
            <div class="text-2xl font-bold text-white mb-1">$${item.price.toFixed(2)}</div>
            <div class="${changeColor}">
              ${changeIcon} ${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)
            </div>
            <div class="text-sm text-gray-400 mt-1">${item.latestTradingDay}</div>
          </div>
        `;
      }
    });
    
    marketTrendsContainer.innerHTML = html;
    console.log('Market trends loaded successfully');
  } catch (error) {
    console.error('Error loading market trends:', error);
    marketTrendsContainer.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load market data</div>';
  }
}

async function setupStockComparison() {
  const stockSelectors = document.querySelectorAll('.stock-selector');
  const chartCanvas = document.getElementById('stock-comparison-chart');
  
  if (!chartCanvas) {
    console.log('Stock comparison chart canvas not found');
    return;
  }
  
  const ctx = chartCanvas.getContext('2d');
  
  // Initialize with AAPL data
  try {
    const timeSeriesData = await fetchStockTimeSeries('AAPL', 'daily');
    const last30Days = timeSeriesData.slice(-30);
    
    const chartData = {
      labels: last30Days.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [{
        label: 'AAPL',
        data: last30Days.map(item => item.close),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }]
    };
    
    const stockChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f59e0b'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#f59e0b'
            },
            grid: {
              color: 'rgba(245, 158, 11, 0.2)'
            }
          },
          y: {
            ticks: {
              color: '#f59e0b'
            },
            grid: {
              color: 'rgba(245, 158, 11, 0.2)'
            }
          }
        }
      }
    });
    
    stockSelectors.forEach(button => {
      button.addEventListener('click', async function() {
        stockSelectors.forEach(btn => {
          btn.classList.remove('bg-gold-500');
          btn.classList.add('bg-gold-500/20');
        });
        
        this.classList.remove('bg-gold-500/20');
        this.classList.add('bg-gold-500');
        
        const symbol = this.dataset.symbol;
        await updateStockChart(stockChart, symbol);
        
        showToast(`Selected ${symbol} for comparison`);
      });
    });
  } catch (error) {
    console.error('Error setting up stock comparison:', error);
    chartCanvas.parentElement.innerHTML = '<div class="text-red-500">Failed to load stock chart data</div>';
  }
  
  console.log('Stock comparison chart setup complete');
}

async function updateStockChart(chart, symbol) {
  try {
    const timeSeriesData = await fetchStockTimeSeries(symbol, 'daily');
    const last30Days = timeSeriesData.slice(-30);
    
    chart.data.datasets[0].label = symbol;
    chart.data.labels = last30Days.map(item => new Date(item.date).toLocaleDateString());
    chart.data.datasets[0].data = last30Days.map(item => item.close);
    chart.update();
    
    console.log(`Updated chart for ${symbol}`);
  } catch (error) {
    console.error(`Error updating chart for ${symbol}:`, error);
    showToast(`Failed to load data for ${symbol}`, 'error');
  }
}

async function setupCryptoChart() {
  const chartCanvas = document.getElementById('crypto-chart');
  const timeSelectors = document.querySelectorAll('.time-selector');
  
  if (!chartCanvas) {
    console.log('Crypto chart canvas not found');
    return;
  }
  
  try {
    const cryptoData = await getMajorCrypto();
    const bitcoin = cryptoData.find(crypto => crypto.symbol === 'BTC');
    
    if (!bitcoin) {
      throw new Error('Bitcoin data not found');
    }
    
    const ctx = chartCanvas.getContext('2d');
    
    // For demo purposes, create sample historical data
    const sampleData = generateSampleCryptoData(bitcoin.price);
    
    const cryptoChartData = {
      labels: sampleData.labels,
      datasets: [{
        label: 'Bitcoin (BTC)',
        data: sampleData.data,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
    
    const cryptoChart = new Chart(ctx, {
      type: 'line',
      data: cryptoChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f59e0b'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#f59e0b'
            },
            grid: {
              color: 'rgba(245, 158, 11, 0.2)'
            }
          },
          y: {
            ticks: {
              color: '#f59e0b',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(245, 158, 11, 0.2)'
            }
          }
        }
      }
    });
    
    timeSelectors.forEach(button => {
      button.addEventListener('click', function() {
        timeSelectors.forEach(btn => {
          btn.classList.remove('bg-gold-500/20');
          btn.classList.add('border-gold-500/30');
        });
        
        this.classList.add('bg-gold-500/20');
        
        const period = this.dataset.period;
        updateCryptoChart(cryptoChart, period, bitcoin.price);
        
        showToast(`Updated chart for ${period} period`);
      });
    });
  } catch (error) {
    console.error('Error setting up crypto chart:', error);
    chartCanvas.parentElement.innerHTML = '<div class="text-red-500">Failed to load crypto chart data</div>';
  }
  
  console.log('Crypto chart setup complete');
}

function generateSampleCryptoData(currentPrice) {
  const labels = [];
  const data = [];
  const basePrice = currentPrice * 0.95; // Start slightly lower
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice * (1 + variation + (i * 0.01)); // Slight upward trend
    data.push(price);
  }
  
  return { labels, data };
}

function updateCryptoChart(chart, period, basePrice) {
  const periodData = generateSampleCryptoData(basePrice);
  
  chart.data.labels = periodData.labels;
  chart.data.datasets[0].data = periodData.data;
  chart.update();
  
  console.log(`Updated crypto chart for ${period} period`);
}

async function setupStockSearch() {
  const searchForm = document.getElementById('stock-search-form');
  const searchInput = document.getElementById('stock-search-input');
  const resultsSection = document.getElementById('stock-lookup-section');
  const resultsContainer = document.getElementById('stock-results');
  
  if (!searchForm) {
    console.log('Stock search form not found');
    return;
  }
  
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const symbol = searchInput.value.trim().toUpperCase();
    if (!symbol) {
      showToast('Please enter a stock symbol', 'error');
      return;
    }
    
    console.log(`Searching for stock: ${symbol}`);
    
    try {
      resultsContainer.innerHTML = '<div class="text-center text-gold-400">Loading stock data...</div>';
      resultsSection.classList.remove('hidden');
      
      const stockData = await fetchStockData(symbol);
      
      const isPositive = stockData.change >= 0;
      const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
      const changeIcon = isPositive ? '▲' : '▼';
      
      resultsContainer.innerHTML = `
        <div class="glass rounded-lg p-6">
          <h3 class="text-2xl font-semibold text-gold-400 mb-2">${stockData.symbol}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-gray-400">Price</p>
              <p class="text-2xl font-bold text-white">$${stockData.price.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-gray-400">Change</p>
              <p class="text-lg font-semibold ${changeColor}">
                ${changeIcon} $${Math.abs(stockData.change).toFixed(2)} (${stockData.changePercent.toFixed(2)}%)
              </p>
            </div>
            <div>
              <p class="text-gray-400">Volume</p>
              <p class="text-lg text-white">${stockData.volume.toLocaleString()}</p>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-400">
            Last trading day: ${stockData.latestTradingDay}
          </div>
        </div>
      `;
      
      showToast(`Found data for ${symbol}`);
      
      console.log(`Successfully loaded data for ${symbol}`);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      resultsContainer.innerHTML = `
        <div class="glass rounded-lg p-6 text-center">
          <p class="text-red-400 mb-2">No data found for "${symbol}"</p>
          <p class="text-gray-400 text-sm">Please check the symbol and try again</p>
        </div>
      `;
      showToast(`No data found for ${symbol}`, 'error');
    }
  });
  
  console.log('Stock search setup complete');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (!toast || !toastMessage) {
    console.log('Toast elements not found');
    return;
  }
  
  toastMessage.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  toast.style.display = 'block';
  
  console.log(`Toast shown: ${message} (${type})`);
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
