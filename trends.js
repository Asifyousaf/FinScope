
// Trends page JavaScript - Simple chart implementation
// This file handles all the interactive features on the trends page

document.addEventListener('DOMContentLoaded', function() {
  console.log('Trends page loaded successfully');
  
  // #Initialize all the page features when page loads
  loadMarketTrends();
  setupStockComparison();
  setupCryptoChart();
  setupStockSearch();
});

// #Load market trends with real-looking mock data
function loadMarketTrends() {
  const marketTrendsContainer = document.getElementById('market-trends');
  if (!marketTrendsContainer) {
    console.log('Market trends container not found');
    return;
  }
  
  // #Simple market data that looks real but is actually mock data
  const marketData = [
    { name: 'S&P 500', symbol: 'SPY', price: 4185.50, change: 2.35, changePercent: 0.056 },
    { name: 'Dow Jones', symbol: 'DIA', price: 34123.88, change: -45.67, changePercent: -0.134 },
    { name: 'NASDAQ', symbol: 'QQQ', price: 14567.23, change: 12.45, changePercent: 0.085 }
  ];
  
  let html = '';
  marketData.forEach(item => {
    // #Check if the change is positive or negative to show right color
    const isPositive = item.change >= 0;
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
    const changeIcon = isPositive ? '▲' : '▼';
    
    // #Build the HTML for each market index card
    html += `
      <div class="glass rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gold-400 mb-2">${item.name}</h3>
        <div class="text-2xl font-bold text-white mb-1">$${item.price.toFixed(2)}</div>
        <div class="${changeColor}">
          ${changeIcon} ${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)
        </div>
      </div>
    `;
  });
  
  // #Put the HTML into the container
  marketTrendsContainer.innerHTML = html;
  console.log('Market trends loaded successfully');
}

// #Setup stock comparison chart with Chart.js
function setupStockComparison() {
  const stockSelectors = document.querySelectorAll('.stock-selector');
  const chartCanvas = document.getElementById('stock-comparison-chart');
  
  if (!chartCanvas) {
    console.log('Stock comparison chart canvas not found');
    return;
  }
  
  // #Create a simple line chart using Chart.js
  const ctx = chartCanvas.getContext('2d');
  
  // #Sample data for the stock chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'AAPL',
      data: [150, 165, 180, 175, 190, 185],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4
    }]
  };
  
  // #Create the chart with Chart.js
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
  
  // #Add click handlers to stock selector buttons
  stockSelectors.forEach(button => {
    button.addEventListener('click', function() {
      // #Remove active class from all buttons first
      stockSelectors.forEach(btn => {
        btn.classList.remove('bg-gold-500');
        btn.classList.add('bg-gold-500/20');
      });
      
      // #Add active class to the clicked button
      this.classList.remove('bg-gold-500/20');
      this.classList.add('bg-gold-500');
      
      // #Update chart data based on selected stock
      const symbol = this.dataset.symbol;
      updateStockChart(stockChart, symbol);
      
      showToast(`Selected ${symbol} for comparison`);
    });
  });
  
  console.log('Stock comparison chart setup complete');
}

// #Function to update stock chart with new data
function updateStockChart(chart, symbol) {
  // #Different mock data for different stocks
  const stockData = {
    'AAPL': [150, 165, 180, 175, 190, 185],
    'MSFT': [200, 215, 230, 225, 240, 235],
    'GOOGL': [2500, 2600, 2700, 2650, 2750, 2720],
    'AMZN': [3000, 3100, 3200, 3150, 3250, 3200]
  };
  
  // #Update the chart data
  chart.data.datasets[0].label = symbol;
  chart.data.datasets[0].data = stockData[symbol] || stockData['AAPL'];
  chart.update();
  
  console.log(`Updated chart for ${symbol}`);
}

// #Setup crypto chart with Chart.js
function setupCryptoChart() {
  const chartCanvas = document.getElementById('crypto-chart');
  const timeSelectors = document.querySelectorAll('.time-selector');
  
  if (!chartCanvas) {
    console.log('Crypto chart canvas not found');
    return;
  }
  
  // #Create crypto price chart
  const ctx = chartCanvas.getContext('2d');
  
  // #Sample Bitcoin price data
  const cryptoData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Bitcoin (BTC)',
      data: [45000, 47000, 43000, 48000, 50000, 52000],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  
  // #Create the crypto chart
  const cryptoChart = new Chart(ctx, {
    type: 'line',
    data: cryptoData,
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
  
  // #Add click handlers to time period buttons
  timeSelectors.forEach(button => {
    button.addEventListener('click', function() {
      // #Remove active class from all time buttons
      timeSelectors.forEach(btn => {
        btn.classList.remove('bg-gold-500/20');
        btn.classList.add('border-gold-500/30');
      });
      
      // #Add active class to clicked time button
      this.classList.add('bg-gold-500/20');
      
      // #Update chart based on time period
      const period = this.dataset.period;
      updateCryptoChart(cryptoChart, period);
      
      showToast(`Updated chart for ${period} period`);
    });
  });
  
  console.log('Crypto chart setup complete');
}

// #Function to update crypto chart with different time periods
function updateCryptoChart(chart, period) {
  // #Different data for different time periods
  const periodData = {
    '1m': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [50000, 52000, 49000, 51000]
    },
    '3m': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      data: [45000, 50000, 52000]
    },
    '6m': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [40000, 45000, 50000, 48000, 52000, 55000]
    },
    '1y': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [35000, 45000, 50000, 55000]
    },
    '5y': {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      data: [10000, 30000, 45000, 40000, 55000]
    }
  };
  
  const data = periodData[period] || periodData['1m'];
  
  // #Update chart with new data
  chart.data.labels = data.labels;
  chart.data.datasets[0].data = data.data;
  chart.update();
  
  console.log(`Updated crypto chart for ${period} period`);
}

// #Setup stock search functionality
function setupStockSearch() {
  const searchForm = document.getElementById('stock-search-form');
  const searchInput = document.getElementById('stock-search-input');
  const resultsSection = document.getElementById('stock-lookup-section');
  const resultsContainer = document.getElementById('stock-results');
  
  if (!searchForm) {
    console.log('Stock search form not found');
    return;
  }
  
  // #Handle form submission when user searches for a stock
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); // #Prevent page reload
    
    const symbol = searchInput.value.trim().toUpperCase();
    if (!symbol) {
      showToast('Please enter a stock symbol', 'error');
      return;
    }
    
    console.log(`Searching for stock: ${symbol}`);
    
    // #Mock stock data for demonstration
    const mockData = {
      'AAPL': { name: 'Apple Inc.', price: 175.43, change: 2.15, volume: '45.2M' },
      'MSFT': { name: 'Microsoft Corporation', price: 378.85, change: -1.25, volume: '32.1M' },
      'GOOGL': { name: 'Alphabet Inc.', price: 2847.73, change: 15.42, volume: '28.7M' },
      'TSLA': { name: 'Tesla Inc.', price: 248.52, change: -8.75, volume: '89.3M' },
      'AMZN': { name: 'Amazon.com Inc.', price: 142.50, change: 3.25, volume: '52.8M' },
      'META': { name: 'Meta Platforms Inc.', price: 315.75, change: -2.15, volume: '38.4M' }
    };
    
    const stockData = mockData[symbol];
    
    if (stockData) {
      // #Check if price change is positive or negative
      const isPositive = stockData.change >= 0;
      const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
      const changeIcon = isPositive ? '▲' : '▼';
      
      // #Create the HTML to show stock information
      resultsContainer.innerHTML = `
        <div class="glass rounded-lg p-6">
          <h3 class="text-2xl font-semibold text-gold-400 mb-2">${symbol}</h3>
          <p class="text-gray-300 mb-4">${stockData.name}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-gray-400">Price</p>
              <p class="text-2xl font-bold text-white">$${stockData.price}</p>
            </div>
            <div>
              <p class="text-gray-400">Change</p>
              <p class="text-lg font-semibold ${changeColor}">
                ${changeIcon} $${Math.abs(stockData.change).toFixed(2)}
              </p>
            </div>
            <div>
              <p class="text-gray-400">Volume</p>
              <p class="text-lg text-white">${stockData.volume}</p>
            </div>
          </div>
        </div>
      `;
      
      // #Show the results section
      resultsSection.classList.remove('hidden');
      showToast(`Found data for ${symbol}`);
      
      console.log(`Successfully loaded data for ${symbol}`);
    } else {
      // #Stock not found in our mock data
      showToast(`No data found for ${symbol}. Try AAPL, MSFT, GOOGL, TSLA, AMZN, or META`, 'error');
      console.log(`No data found for ${symbol}`);
    }
  });
  
  console.log('Stock search setup complete');
}

// #Simple toast notification function to show messages to user
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (!toast || !toastMessage) {
    console.log('Toast elements not found');
    return;
  }
  
  // #Set the message and style based on type
  toastMessage.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  toast.style.display = 'block';
  
  console.log(`Toast shown: ${message} (${type})`);
  
  // #Hide the toast after 3 seconds
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
