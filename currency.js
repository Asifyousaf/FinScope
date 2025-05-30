document.addEventListener('DOMContentLoaded', function () {
  initializeCurrencyConverter();
  setupEventListeners();
  loadMajorCurrencyPairs();
  loadConversionHistory();
});

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
    amountInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9.]/g, '');
    });
  }
}

function initializeCurrencyConverter() {
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');

  if (!fromCurrencySelect || !toCurrencySelect) return;

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];

  currencies.forEach(code => {
    const fromOption = document.createElement('option');
    fromOption.value = code;
    fromOption.textContent = code;
    fromCurrencySelect.appendChild(fromOption);

    const toOption = document.createElement('option');
    toOption.value = code;
    toOption.textContent = code;
    toCurrencySelect.appendChild(toOption);
  });

  fromCurrencySelect.value = 'USD';
  toCurrencySelect.value = 'EUR';
}

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

  if (placeholderElement) placeholderElement.style.display = 'none';
  if (resultElement) resultElement.style.display = 'none';
  if (loadingElement) loadingElement.style.display = 'flex';

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
    const data = await response.json();
    const rate = data.rates[toCurrency];
    const converted = rate;

    resultElement.innerHTML = `
      <div class="text-2xl font-bold gradient-text mb-2">
        ${amount.toFixed(2)} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}
      </div>
      <div class="text-gray-400 text-sm">
        1 ${fromCurrency} = ${(rate / amount).toFixed(4)} ${toCurrency}
      </div>
    `;
    resultElement.style.display = 'block';
    loadingElement.style.display = 'none';

    addToConversionHistory(fromCurrency, toCurrency, amount, converted);
    showToast('Currency converted successfully');
  } catch (error) {
    console.error('API error:', error);
    showToast('Failed to fetch exchange rate', 'error');
    loadingElement.style.display = 'none';
  }
}

function swapCurrencies() {
  const fromSelect = document.getElementById('from-currency');
  const toSelect = document.getElementById('to-currency');

  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  showToast('Currencies swapped');
}

async function loadMajorCurrencyPairs() {
  const majorPairsElement = document.getElementById('major-pairs');
  if (!majorPairsElement) return;

  const pairs = [
    ['EUR', 'USD'],
    ['USD', 'JPY'],
    ['GBP', 'USD'],
    ['USD', 'CHF'],
    ['USD', 'CAD'],
    ['AUD', 'USD']
  ];

  let html = '';

  for (const [from, to] of pairs) {
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${from}&to=${to}`);
      const data = await res.json();
      const rate = data.rates[to];

      html += `
        <div class="glass glass-hover rounded-lg p-4">
          <div class="flex justify-between items-center">
            <div class="font-semibold text-gold-400">${from}/${to}</div>
            <div class="text-lg">${rate.toFixed(4)}</div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error(`Error loading rate for ${from}/${to}`, e);
    }
  }

  majorPairsElement.innerHTML = html;
}

function addToConversionHistory(from, to, amount, converted) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch { }

  history.unshift({
    id: Date.now(),
    fromCurrency: from,
    toCurrency: to,
    amount,
    convertedAmount: converted,
    timestamp: new Date().toISOString()
  });

  history = history.slice(0, 5);
  localStorage.setItem('conversionHistory', JSON.stringify(history));
  loadConversionHistory();
}

function loadConversionHistory() {
  const historyElement = document.getElementById('conversion-history');
  if (!historyElement) return;

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch { }

  if (history.length === 0) {
    historyElement.innerHTML = '<p class="text-gray-400">No conversion history yet</p>';
    return;
  }

  historyElement.innerHTML = history.map(item => {
    const date = new Date(item.timestamp).toLocaleString();
    return `
      <div class="glass glass-hover rounded-lg p-4 mb-2">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold text-gold-400">
              ${item.amount.toFixed(2)} ${item.fromCurrency} → ${item.convertedAmount.toFixed(2)} ${item.toCurrency}
            </div>
            <div class="text-sm text-gray-400">${date}</div>
          </div>
          <button class="text-gold-400 hover:text-gold-300" onclick="deleteConversionHistory(${item.id})">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteConversionHistory(id) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  } catch { }

  history = history.filter(item => item.id !== id);
  localStorage.setItem('conversionHistory', JSON.stringify(history));
  loadConversionHistory();
  showToast('History item deleted');
}

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
