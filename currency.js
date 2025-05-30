// Currency converter functionality using Frankfurter API
document.addEventListener('DOMContentLoaded', function() {
  console.log('Currency page loaded');
  
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
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'INR', name: 'Indian Rupee' }
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
async function handleCurrencyConversion() {
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
  
  try {
    const exchangeRate = await convertCurrency(fromCurrency, toCurrency);
    if (exchangeRate) {
      const convertedAmount = amount * exchangeRate;
      
      if (resultElement) {
        resultElement.innerHTML = `
          <div class="text-2xl font-bold gradient-text mb-2">
            ${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}
          </div>
          <div class="text-gray-400 text-sm">
            1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}
          </div>
          <div class="text-gray-400 text-xs mt-1">
            Last updated: ${new Date().toLocaleDateString()}
          </div>
        `;
        resultElement.style.display = 'block';
      }
      
      addToConversionHistory(fromCurrency, toCurrency, amount, convertedAmount);
      showToast('Currency converted successfully');
    } else {
      throw new Error('Failed to get exchange rate');
    }
    
  } catch (error) {
    console.error('Currency conversion failed:', error);
    showToast('Failed to get exchange rate. Please try again.', 'error');
  } finally {
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

// Convert currency using Frankfurter API
async function convertCurrency(from = 'USD', to = 'GBP') {
  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`1 ${from} = ${data.rates[to]} ${to}`);
    return data.rates[to];
  } catch (err) {
    console.error('Currency fetch failed:', err);
    return null;
  }
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
async function loadMajorCurrencyPairs() {
  const majorPairsElement = document.getElementById('major-pairs');
  if (!majorPairsElement) return;
  
  const pairs = [
    { from: 'EUR', to: 'USD' },
    { from: 'USD', to: 'JPY' },
    { from: 'GBP', to: 'USD' },
    { from: 'USD', to: 'CHF' },
    { from: 'USD', to: 'CAD' },
    { from: 'AUD', to: 'USD' },
    { from: 'USD', to: 'AED' },
    { from: 'USD', to: 'INR' }
  ];
  
  majorPairsElement.innerHTML = '<div class="animate-pulse text-gold-400">Loading exchange rates...</div>';
  
  try {
    const pairPromises = pairs.map(async (pair) => {
      try {
        const rate = await convertCurrency(pair.from, pair.to);
        return rate ? {
          fromCurrency: pair.from,
          toCurrency: pair.to,
          rate: rate
        } : null;
      } catch (error) {
        console.error(`Failed to fetch ${pair.from}/${pair.to}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(pairPromises);
    const validResults = results.filter(result => result !== null);
    
    if (validResults.length > 0) {
      let pairsHTML = '';
      validResults.forEach(pair => {
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
    } else {
      majorPairsElement.innerHTML = '<div class="text-red-500">Failed to load exchange rates</div>';
    }
    
  } catch (error) {
    console.error('Error loading major pairs:', error);
    majorPairsElement.innerHTML = '<div class="text-red-500">Failed to load exchange rates</div>';
  }
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
