
// Simple currency converter functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Currency page loaded');
  
  // Initialize the page
  initializeCurrencyConverter();
  loadMajorCurrencyPairs();
  setupEventListeners();
  loadConversionHistory();
});

// Setup event listeners
function setupEventListeners() {
  const convertBtn = document.getElementById('convert-btn');
  const swapBtn = document.getElementById('swap-currencies');
  const amountInput = document.getElementById('amount');
  
  if (convertBtn) {
    convertBtn.addEventListener('click', handleCurrencyConversion);
  }
  
  if (swapBtn) {
    swapBtn.addEventListener('click', swapCurrencies);
  }
  
  if (amountInput) {
    amountInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9.]/g, '');
    });
  }
}

// Initialize currency converter with simple currency list
function initializeCurrencyConverter() {
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  
  if (!fromCurrencySelect || !toCurrencySelect) return;
  
  // Simple list of currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];
  
  // Clear existing options
  fromCurrencySelect.innerHTML = '';
  toCurrencySelect.innerHTML = '';
  
  // Add options to both selects
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

// Handle currency conversion with simple mock exchange rates
function handleCurrencyConversion() {
  const fromCurrency = document.getElementById('from-currency').value;
  const toCurrency = document.getElementById('to-currency').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const resultElement = document.getElementById('conversion-result');
  const loadingElement = document.getElementById('conversion-loading');
  const placeholderElement = document.getElementById('conversion-placeholder');
  
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }
  
  if (fromCurrency === toCurrency) {
    showToast('Please select different currencies', 'error');
    return;
  }
  
  // Hide placeholder and result, show loading
  if (placeholderElement) placeholderElement.style.display = 'none';
  if (resultElement) resultElement.style.display = 'none';
  if (loadingElement) loadingElement.style.display = 'flex';
  
  // Simple mock exchange rates
  const exchangeRates = {
    'USD_EUR': 0.92,
    'EUR_USD': 1.09,
    'USD_GBP': 0.79,
    'GBP_USD': 1.27,
    'USD_JPY': 150.25,
    'JPY_USD': 0.0067,
    'USD_CAD': 1.36,
    'CAD_USD': 0.74,
    'USD_AUD': 1.52,
    'AUD_USD': 0.66,
    'EUR_GBP': 0.86,
    'GBP_EUR': 1.16
  };
  
  // Simulate API delay
  setTimeout(() => {
    const rateKey = `${fromCurrency}_${toCurrency}`;
    let exchangeRate = exchangeRates[rateKey];
    
    // If no direct rate, use USD as base
    if (!exchangeRate) {
      const toUsdRate = exchangeRates[`${fromCurrency}_USD`] || 1;
      const fromUsdRate = exchangeRates[`USD_${toCurrency}`] || 1;
      exchangeRate = toUsdRate * fromUsdRate;
    }
    
    // Default rate if still not found
    if (!exchangeRate) {
      exchangeRate = 1.0;
    }
    
    const convertedAmount = amount * exchangeRate;
    
    // Show result
    if (resultElement) {
      resultElement.innerHTML = `
        <div class="text-2xl font-bold gradient-text mb-2">
          ${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}
        </div>
        <div class="text-gray-400 text-sm">
          1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}
        </div>
      `;
      resultElement.style.display = 'block';
    }
    
    if (loadingElement) loadingElement.style.display = 'none';
    
    // Add to history
    addToConversionHistory(fromCurrency, toCurrency, amount, convertedAmount);
    
    showToast('Currency converted successfully');
  }, 1000);
}

// Swap currencies
function swapCurrencies() {
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  
  if (!fromCurrencySelect || !toCurrencySelect) return;
  
  const tempValue = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempValue;
  
  showToast('Currencies swapped');
}

// Load major currency pairs with simple data
function loadMajorCurrencyPairs() {
  const majorPairsElement = document.getElementById('major-pairs');
  if (!majorPairsElement) return;
  
  const majorPairs = [
    { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.0867 },
    { fromCurrency: 'USD', toCurrency: 'JPY', rate: 150.39 },
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

// Add to conversion history
function addToConversionHistory(fromCurrency, toCurrency, amount, convertedAmount) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch (e) {
    history = [];
  }
  
  const newConversion = {
    id: Date.now(),
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    timestamp: new Date().toISOString()
  };
  
  history.unshift(newConversion);
  history = history.slice(0, 5); // Keep only 5 items
  
  try {
    localStorage.setItem('conversionHistory', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save to localStorage');
  }
  
  loadConversionHistory();
}

// Load conversion history
function loadConversionHistory() {
  const historyElement = document.getElementById('conversion-history');
  if (!historyElement) return;
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch (e) {
    history = [];
  }
  
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
            onclick="deleteConversionHistory(${item.id})"
          >
            ✕
          </button>
        </div>
      </div>
    `;
  });
  
  historyElement.innerHTML = historyHTML;
}

// Delete conversion history item
function deleteConversionHistory(id) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch (e) {
    history = [];
  }
  
  history = history.filter(item => item.id !== parseInt(id));
  
  try {
    localStorage.setItem('conversionHistory', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save to localStorage');
  }
  
  loadConversionHistory();
  showToast('History item deleted');
}

// Simple toast notification
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
