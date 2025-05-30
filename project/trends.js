import { 
  fetchStockTimeSeries,
  fetchStockData,
  mockStockData,
  mockCryptoData
} from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Load Chart.js from CDN
  await loadChartJS();
  
  // Initialize market trends
  initializeMarketTrends();
  
  // Initialize stock comparison chart
  initializeStockComparisonChart();
  
  // Initialize cryptocurrency chart
  initializeCryptoChart();
  
  // Initialize stock lookup
  initializeStockLookup();
});

// Load Chart.js from CDN
async function loadChartJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize market trends
function initializeMarketTrends() {
  const trendsElement = document.getElementById('market-trends');
  if (!trendsElement) return;
  
  const marketIndices = [
    { 
      name: 'S&P 500', 
      symbol: 'SPY',
      data: [4500, 4525, 4510, 4550, 4580, 4600, 4590, 4610, 4640, 4630, 4650, 4700, 4720, 4740, 4760, 4780, 4800, 4820, 4810, 4830],
      color: '#f59e0b'
    },
    { 
      name: 'Dow Jones', 
      symbol: 'DIA',
      data: [35000, 35200, 35100, 35300, 35400, 35500, 35600, 35400, 35600, 35700, 35800, 35900, 36000, 36100, 36200, 36300, 36400, 36500, 36600, 36700],
      color: '#00d4ff'
    },
    { 
      name: 'NASDAQ', 
      symbol: 'QQQ',
      data: [15000, 15200, 15100, 15300, 15400, 15600, 15500, 15700, 15800, 15900, 16000, 16100, 16200, 16300, 16400, 16500, 16600, 16700, 16800, 16900],
      color: '#a855f7'
    }
  ];
  
  marketIndices.forEach(index => {
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'glass glass-hover rounded-lg p-4';
    
    const chartHeader = document.createElement('div');
    chartHeader.className = 'flex justify-between items-center mb-4';
    chartHeader.innerHTML = `
      <h3 class="font-semibold text-gold-400">${index.name}</h3>
      <span class="text-sm text-gray-400">${index.symbol}</span>
    `;
    
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = `chart-${index.symbol}`;
    chartCanvas.height = 200;
    
    chartContainer.appendChild(chartHeader);
    chartContainer.appendChild(chartCanvas);
    trendsElement.appendChild(chartContainer);
    
    // Create chart
    const ctx = chartCanvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: index.data.length }, (_, i) => i + 1),
        datasets: [{
          label: index.name,
          data: index.data,
          borderColor: index.color,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: {
            target: 'origin',
            above: `${index.color}20`
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: index.color,
            bodyColor: '#ffffff',
            borderColor: index.color,
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#f8f8f8'
            }
          }
        }
      }
    });
  });
}

// Initialize stock comparison chart
function initializeStockComparisonChart() {
  const chartElement = document.getElementById('stock-comparison-chart');
  if (!chartElement) return;
  
  // Create data for tech stocks comparison
  const stockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'AAPL',
        data: [180, 182, 175, 178, 182, 185, 190, 195, 200, 190, 192, 195],
        borderColor: '#f59e0b',
        tension: 0.3,
        pointRadius: 2
      },
      {
        label: 'MSFT',
        data: [380, 385, 390, 395, 400, 410, 415, 420, 425, 430, 425, 420],
        borderColor: '#00d4ff',
        tension: 0.3,
        pointRadius: 2
      },
      {
        label: 'GOOGL',
        data: [145, 147, 150, 153, 155, 158, 160, 162, 165, 168, 170, 172],
        borderColor: '#a855f7',
        tension: 0.3,
        pointRadius: 2
      },
      {
        label: 'AMZN',
        data: [165, 170, 168, 172, 175, 180, 183, 185, 188, 190, 195, 193],
        borderColor: '#00ff88',
        tension: 0.3,
        pointRadius: 2
      }
    ]
  };
  
  // Create chart
  const chart = new Chart(chartElement, {
    type: 'line',
    data: stockData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#f8f8f8',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleColor: '#f59e0b',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f8f8f8'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f8f8f8'
          }
        }
      }
    }
  });
  
  // Add event listeners to stock selector buttons
  document.querySelectorAll('.stock-selector').forEach(button => {
    button.addEventListener('click', function() {
      const symbol = this.dataset.symbol;
      const active = this.classList.contains('bg-gold-500/20');
      
      if (active) {
        // If already active, deactivate
        this.classList.remove('bg-gold-500/20');
        
        // Hide dataset in chart
        const datasetIndex = chart.data.datasets.findIndex(ds => ds.label === symbol);
        if (datasetIndex !== -1) {
          chart.data.datasets[datasetIndex].hidden = true;
          chart.update();
        }
      } else {
        // Activate
        this.classList.add('bg-gold-500/20');
        
        // Show dataset in chart
        const datasetIndex = chart.data.datasets.findIndex(ds => ds.label === symbol);
        if (datasetIndex !== -1) {
          chart.data.datasets[datasetIndex].hidden = false;
          chart.update();
        }
      }
    });
  });
}

// Initialize cryptocurrency chart
function initializeCryptoChart() {
  const chartElement = document.getElementById('crypto-chart');
  if (!chartElement) return;
  
  // Generate mock data for Bitcoin price
  const btcData = [];
  let price = 60000;
  for (let i = 0; i < 90; i++) {
    // Add some randomness to create realistic price movement
    const change = (Math.random() - 0.45) * 1000;
    price += change;
    price = Math.max(price, 50000); // Set a floor
    btcData.push(price);
  }
  
  // Create chart
  const chart = new Chart(chartElement, {
    type: 'line',
    data: {
      labels: Array.from({ length: btcData.length }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (btcData.length - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Bitcoin (USD)',
        data: btcData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#f8f8f8'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleColor: '#f59e0b',
          bodyColor: '#ffffff',
          borderColor: 'rgba(245, 158, 11, 0.5)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw, 'USD')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f8f8f8',
            maxTicksLimit: 10
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f8f8f8',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // Add time period selectors
  document.querySelectorAll('.time-selector').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.time-selector').forEach(btn => {
        btn.classList.remove('bg-gold-500/20');
      });
      
      this.classList.add('bg-gold-500/20');
      
      const period = this.dataset.period;
      let days;
      
      switch (period) {
        case '1m': days = 30; break;
        case '3m': days = 90; break;
        case '6m': days = 180; break;
        case '1y': days = 365; break;
        case '5y': days = 1825; break;
        default: days = 90;
      }
      
      // Update chart with new time period
      updateCryptoChart(chart, days);
    });
  });
}

// Update cryptocurrency chart with new time period
function updateCryptoChart(chart, days) {
  // Generate mock data for the specified time period
  const btcData = [];
  let price = 60000;
  
  for (let i = 0; i < days; i++) {
    // Add some randomness to create realistic price movement
    // More volatility for longer time periods
    const volatilityFactor = days > 90 ? 0.7 : 0.5;
    const change = (Math.random() - 0.48) * 1000 * volatilityFactor;
    price += change;
    price = Math.max(price, 40000); // Set a floor
    btcData.push(price);
  }
  
  // Update chart data
  chart.data.labels = Array.from({ length: btcData.length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (btcData.length - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  chart.data.datasets[0].data = btcData;
  
  // Update x-axis tick count based on time period
  chart.options.scales.x.ticks.maxTicksLimit = days <= 90 ? 10 : (days <= 365 ? 12 : 24);
  
  chart.update();
}

// Initialize stock lookup
function initializeStockLookup() {
  const searchForm = document.getElementById('stock-search-form');
  const searchInput = document.getElementById('stock-search-input');
  const searchResultsElement = document.getElementById('stock-results');
  
  if (!searchForm || !searchInput || !searchResultsElement) return;
  
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const symbol = searchInput.value.trim().toUpperCase();
    if (!symbol) return;
    
    // Show loading
    searchResultsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
    
    try {
      // Fetch stock data
      // In production, use: const stockData = await fetchStockData(symbol);
      
      // For demo, create mock data
      let stockData;
      const existingStock = mockStockData.find(stock => stock.symbol === symbol);
      
      if (existingStock) {
        stockData = existingStock;
      } else {
        // Create random data for unknown symbol
        stockData = {
          symbol: symbol,
          name: `${symbol} Inc.`,
          price: Math.floor(Math.random() * 500) + 50,
          change: (Math.random() * 10) - 5,
          changePercent: (Math.random() * 5) - 2.5
        };
      }
      
      // Generate historical data
      const historicalData = generateHistoricalData(stockData.price);
      
      // Render stock data
      renderStockData(searchResultsElement, stockData, historicalData);
      
      // Show stock results section
      document.getElementById('stock-lookup-section').classList.remove('hidden');
      
      // Scroll to stock results
      document.getElementById('stock-lookup-section').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error fetching stock data:', error);
      searchResultsElement.innerHTML = '<p class="text-red-500 text-center py-8">Failed to fetch stock data. Please try again with a valid symbol.</p>';
    }
  });
}

// Render stock data
function renderStockData(container, stockData, historicalData) {
  const changeClass = stockData.change >= 0 ? 'text-neon-green' : 'text-red-500';
  const changeIcon = stockData.change >= 0 ? 
    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
  
  let html = `
    <div class="glass rounded-lg p-6">
      <div class="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold gradient-text">${stockData.symbol}</h2>
          <p class="text-gray-400">${stockData.name}</p>
        </div>
        <div class="mt-4 md:mt-0 text-right">
          <div class="text-3xl font-bold">${formatCurrency(stockData.price, 'USD')}</div>
          <div class="flex items-center ${changeClass} justify-end">
            ${changeIcon}
            <span class="ml-1">${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <canvas id="stock-detail-chart" height="300"></canvas>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="glass p-3 rounded-lg">
          <p class="text-sm text-gray-400">Open</p>
          <p class="text-lg font-semibold">${formatCurrency(stockData.price - (Math.random() * 5), 'USD')}</p>
        </div>
        <div class="glass p-3 rounded-lg">
          <p class="text-sm text-gray-400">High</p>
          <p class="text-lg font-semibold">${formatCurrency(stockData.price + (Math.random() * 8), 'USD')}</p>
        </div>
        <div class="glass p-3 rounded-lg">
          <p class="text-sm text-gray-400">Low</p>
          <p class="text-lg font-semibold">${formatCurrency(stockData.price - (Math.random() * 8), 'USD')}</p>
        </div>
        <div class="glass p-3 rounded-lg">
          <p class="text-sm text-gray-400">Volume</p>
          <p class="text-lg font-semibold">${(Math.floor(Math.random() * 10000) + 1000).toLocaleString()}</p>
        </div>
      </div>
      
      <div class="glass p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gold-400 mb-3">Company Overview</h3>
        <p class="text-gray-300">
          ${stockData.name} is a publicly traded company with the ticker symbol ${stockData.symbol}. 
          The company operates in various sectors including technology, finance, and consumer services.
          This data is for demonstration purposes only.
        </p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Create stock chart
  setTimeout(() => {
    const chartElement = document.getElementById('stock-detail-chart');
    if (chartElement) {
      new Chart(chartElement, {
        type: 'line',
        data: {
          labels: Array.from({ length: historicalData.length }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (historicalData.length - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [{
            label: `${stockData.symbol} Price`,
            data: historicalData,
            borderColor: stockData.change >= 0 ? '#00ff88' : '#ef4444',
            backgroundColor: stockData.change >= 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#f8f8f8'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleColor: '#f59e0b',
              bodyColor: '#ffffff',
              borderColor: 'rgba(245, 158, 11, 0.5)',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${formatCurrency(context.raw, 'USD')}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#f8f8f8',
                maxTicksLimit: 10
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#f8f8f8',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }
  }, 100);
}

// Generate historical data for stock
function generateHistoricalData(currentPrice) {
  const data = [];
  let price = currentPrice;
  
  for (let i = 0; i < 90; i++) {
    // Generate price for previous days with some randomness
    const change = (Math.random() - 0.5) * 10;
    price = price - change; // Go backwards in time
    data.unshift(price); // Add to beginning of array
  }
  
  return data;
}