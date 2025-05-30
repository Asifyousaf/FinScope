import { 
  fetchExchangeRate, 
  fetchHistoricalCurrencyData,
  mockCurrencyData
} from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize currency converter
  initializeCurrencyConverter();
  
  // Initialize major currency pairs
  loadMajorCurrencyPairs();
  
  // Initialize currency chart
  initializeCurrencyChart();
  
  // Load currency conversion history
  loadConversionHistory();
  
  // Set up event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Convert button click event
  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.addEventListener('click', handleCurrencyConversion);
  }
  
  // Swap currencies button
  const swapBtn = document.getElementById('swap-currencies');
  if (swapBtn) {
    swapBtn.addEventListener('click', swapCurrencies);
  }
  
  // Amount input event
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    amountInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9.]/g, '');
    });
  }
  
  // Historical data time period selector
  const periodSelector = document.getElementById('chart-period');
  if (periodSelector) {
    periodSelector.addEventListener('change', function() {
      updateCurrencyChart(this.value);
    });
  }
}

// Initialize currency converter
function initializeCurrencyConverter() {
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  
  if (!fromCurrencySelect || !toCurrencySelect) return;
  
  // Common currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'ZAR', name: 'South African Rand' }
  ];
  
  // Populate dropdown options
  currencies.forEach(currency => {
    const fromOption = document.createElement('option');
    fromOption.value = currency.code;
    fromOption.textContent = `${currency.code} - ${currency.name}`;
    
    const toOption = document.createElement('option');
    toOption.value = currency.code;
    toOption.textContent = `${currency.code} - ${currency.name}`;
    
    fromCurrencySelect.appendChild(fromOption);
    toCurrencySelect.appendChild(toOption);
  });
  
  // Set default values
  fromCurrencySelect.value = 'USD';
  toCurrencySelect.value = 'EUR';
}

// Handle currency conversion
async function handleCurrencyConversion() {
  const fromCurrency = document.getElementById('from-currency').value;
  const toCurrency = document.getElementById('to-currency').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const resultElement = document.getElementById('conversion-result');
  const loadingElement = document.getElementById('conversion-loading');
  
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }
  
  if (fromCurrency === toCurrency) {
    showToast('Please select different currencies', 'error');
    return;
  }
  
  try {
    resultElement.style.display = 'none';
    loadingElement.style.display = 'flex';
    
    // Try to fetch live data
    let exchangeRateData;
    
    try {
      exchangeRateData = await fetchExchangeRate(fromCurrency, toCurrency);
    } catch (apiError) {
      console.warn('API error, using mock data:', apiError);
      // Use mock data as fallback (for demo/development)
      const mockPair = `${fromCurrency}_${toCurrency}`;
      
      if (mockCurrencyData[mockPair]) {
        exchangeRateData = {
          rate: mockCurrencyData[mockPair].rate,
          fromCurrencyCode: fromCurrency,
          toCurrencyCode: toCurrency
        };
      } else {
        // If no specific mock data, use a random reasonable rate
        const randomRate = (Math.random() * 2 + 0.5).toFixed(4);
        exchangeRateData = {
          rate: parseFloat(randomRate),
          fromCurrencyCode: fromCurrency,
          toCurrencyCode: toCurrency
        };
      }
    }
    
    const convertedAmount = amount * exchangeRateData.rate;
    
    // Add to conversion history
    addToConversionHistory(fromCurrency, toCurrency, amount, convertedAmount);
    
    // Show result
    resultElement.innerHTML = `
      <div class="text-2xl font-bold gradient-text mb-2">
        ${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}
      </div>
      <div class="text-gray-400 text-sm">
        1 ${fromCurrency} = ${exchangeRateData.rate} ${toCurrency}
      </div>
    `;
    
    resultElement.style.display = 'block';
    loadingElement.style.display = 'none';
    
    // Update chart
    updateCurrencyChart('1m', fromCurrency, toCurrency);
    
  } catch (error) {
    console.error('Conversion error:', error);
    showToast('Failed to convert currency. Please try again.', 'error');
    loadingElement.style.display = 'none';
  }
}

// Swap currencies
function swapCurrencies() {
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  
  const tempValue = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempValue;
}

// Load major currency pairs
function loadMajorCurrencyPairs() {
  const majorPairsElement = document.getElementById('major-pairs');
  if (!majorPairsElement) return;
  
  const majorPairs = [
    { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.0867 },
    { fromCurrency: 'USD', toCurrency: 'JPY', rate: 153.8900 },
    { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.2537 },
    { fromCurrency: 'USD', toCurrency: 'CHF', rate: 0.9048 },
    { fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.3652 },
    { fromCurrency: 'AUD', toCurrency: 'USD', rate: 0.6604 }
  ];
  
  let pairsHTML = '';
  majorPairs.forEach(pair => {
    pairsHTML += `
      <div class="glass glass-hover rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div class="font-semibold text-gold-400">${pair.fromCurrency}/${pair.toCurrency}</div>
          <div class="text-lg">${pair.rate.toFixed(4)}</div>
        </div>
      </div>
    `;
  });
  
  majorPairsElement.innerHTML = pairsHTML;
}

// Initialize currency chart (using Chart.js)
function initializeCurrencyChart() {
  const chartCanvas = document.getElementById('currency-chart');
  if (!chartCanvas) return;
  
  // Load Chart.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = function() {
    // Default chart data
    const defaultData = {
      labels: Array.from({ length: 30 }, (_, i) => i + 1),
      datasets: [{
        label: 'USD/EUR Exchange Rate',
        data: Array.from({ length: 30 }, () => (Math.random() * 0.05 + 0.9).toFixed(4)),
        fill: false,
        borderColor: '#f59e0b',
        tension: 0.1
      }]
    };
    
    // Create chart
    window.currencyChart = new Chart(chartCanvas, {
      type: 'line',
      data: defaultData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f8f8f8'
            }
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
    
    // Update chart with real data
    updateCurrencyChart('1m');
  };
  
  document.head.appendChild(script);
}

// Update currency chart with new data
async function updateCurrencyChart(period = '1m', fromCurrency = 'USD', toCurrency = 'EUR') {
  if (!window.currencyChart) return;
  
  const chartLoadingElement = document.getElementById('chart-loading');
  if (chartLoadingElement) {
    chartLoadingElement.style.display = 'flex';
  }
  
  try {
    // For demo purposes, generate random data
    // In production, use: const historicalData = await fetchHistoricalCurrencyData(fromCurrency, toCurrency);
    
    let days;
    switch (period) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      default: days = 30;
    }
    
    const labels = [];
    const data = [];
    
    // Generate dates and data points
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Base rate with random fluctuation
      let baseRate = 0;
      if (fromCurrency === 'USD' && toCurrency === 'EUR') {
        baseRate = 0.93;
      } else if (fromCurrency === 'EUR' && toCurrency === 'USD') {
        baseRate = 1.07;
      } else {
        baseRate = 1.0;
      }
      
      const randomFluctuation = (Math.random() * 0.1) - 0.05;
      data.push((baseRate + randomFluctuation).toFixed(4));
    }
    
    // Update chart
    window.currencyChart.data.labels = labels;
    window.currencyChart.data.datasets[0].label = `${fromCurrency}/${toCurrency} Exchange Rate`;
    window.currencyChart.data.datasets[0].data = data;
    window.currencyChart.update();
    
  } catch (error) {
    console.error('Error updating chart:', error);
  } finally {
    if (chartLoadingElement) {
      chartLoadingElement.style.display = 'none';
    }
  }
}

// Add to conversion history
function addToConversionHistory(fromCurrency, toCurrency, amount, convertedAmount) {
  const historyElement = document.getElementById('conversion-history');
  if (!historyElement) return;
  
  // Get existing history or initialize new array
  let history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  
  // Add new conversion
  const newConversion = {
    id: Date.now(),
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    timestamp: new Date().toISOString()
  };
  
  // Add to beginning of array and limit to 5 items
  history.unshift(newConversion);
  history = history.slice(0, 5);
  
  // Save to localStorage
  localStorage.setItem('conversionHistory', JSON.stringify(history));
  
  // Update UI
  loadConversionHistory();
}

// Load conversion history
function loadConversionHistory() {
  const historyElement = document.getElementById('conversion-history');
  if (!historyElement) return;
  
  // Get history from localStorage
  const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  
  if (history.length === 0) {
    historyElement.innerHTML = '<p class="text-gray-400">No conversion history yet</p>';
    return;
  }
  
  let historyHTML = '';
  history.forEach(item => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    historyHTML += `
      <div class="glass glass-hover rounded-lg p-4 mb-2">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold text-gold-400">
              ${item.amount.toFixed(2)} ${item.fromCurrency} → ${item.convertedAmount.toFixed(2)} ${item.toCurrency}
            </div>
            <div class="text-sm text-gray-400">${formattedDate}</div>
          </div>
          <button 
            class="text-gold-400 hover:text-gold-300 delete-history" 
            data-id="${item.id}"
            aria-label="Delete conversion"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  });
  
  historyElement.innerHTML = historyHTML;
  
  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-history').forEach(button => {
    button.addEventListener('click', function() {
      deleteConversionHistory(this.dataset.id);
    });
  });
}

// Delete conversion history item
function deleteConversionHistory(id) {
  // Get history from localStorage
  let history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  
  // Remove item with matching id
  history = history.filter(item => item.id !== parseInt(id));
  
  // Save to localStorage
  localStorage.setItem('conversionHistory', JSON.stringify(history));
  
  // Update UI
  loadConversionHistory();
  
  showToast('Conversion history item deleted');
}