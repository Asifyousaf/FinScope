// API service module

// Alpha Vantage API Key
const ALPHA_VANTAGE_API_KEY = 'DYC4OFYLHXPSJ777';

// News API Key
const NEWS_API_KEY = '1cb3fb8e7cb64f9f8c7130008c22820c';

// Function to fetch currency exchange rate
export async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data['Realtime Currency Exchange Rate']) {
      return {
        rate: parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']),
        lastRefreshed: data['Realtime Currency Exchange Rate']['6. Last Refreshed'],
        fromCurrencyCode: data['Realtime Currency Exchange Rate']['1. From_Currency Code'],
        fromCurrencyName: data['Realtime Currency Exchange Rate']['2. From_Currency Name'],
        toCurrencyCode: data['Realtime Currency Exchange Rate']['3. To_Currency Code'],
        toCurrencyName: data['Realtime Currency Exchange Rate']['4. To_Currency Name']
      };
    } else {
      throw new Error('Unable to fetch exchange rate data');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
}

// Function to fetch historical currency data
export async function fetchHistoricalCurrencyData(fromCurrency, toCurrency) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data['Time Series FX (Daily)']) {
      const timeSeriesData = data['Time Series FX (Daily)'];
      const formattedData = Object.entries(timeSeriesData).map(([date, values]) => ({
        date,
        close: parseFloat(values['4. close'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return formattedData;
    } else {
      throw new Error('Unable to fetch historical currency data');
    }
  } catch (error) {
    console.error('Error fetching historical currency data:', error);
    throw error;
  }
}

// Function to fetch financial news
export async function fetchFinancialNews(query = 'finance', pageSize = 10) {
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      return data.articles;
    } else {
      throw new Error(data.message || 'Unable to fetch news data');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

// Function to fetch stock data
export async function fetchStockData(symbol) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day']
      };
    } else {
      throw new Error('Unable to fetch stock data');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

// Function to fetch stock time series data
export async function fetchStockTimeSeries(symbol, interval = 'daily') {
  let timeSeriesFunction;
  
  switch (interval) {
    case 'intraday':
      timeSeriesFunction = 'TIME_SERIES_INTRADAY';
      break;
    case 'daily':
      timeSeriesFunction = 'TIME_SERIES_DAILY';
      break;
    case 'weekly':
      timeSeriesFunction = 'TIME_SERIES_WEEKLY';
      break;
    case 'monthly':
      timeSeriesFunction = 'TIME_SERIES_MONTHLY';
      break;
    default:
      timeSeriesFunction = 'TIME_SERIES_DAILY';
  }
  
  try {
    const url = `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&outputsize=compact${interval === 'intraday' ? '&interval=5min' : ''}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    
    if (data[timeSeriesKey]) {
      const timeSeriesData = data[timeSeriesKey];
      return Object.entries(timeSeriesData).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      throw new Error('Unable to fetch time series data');
    }
  } catch (error) {
    console.error('Error fetching stock time series:', error);
    throw error;
  }
}

// Function to search for stocks, currencies, etc.
export async function searchSymbol(keywords) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data.bestMatches) {
      return data.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
        matchScore: match['9. matchScore']
      }));
    } else {
      throw new Error('Unable to search for symbol');
    }
  } catch (error) {
    console.error('Error searching for symbol:', error);
    throw error;
  }
}

// Mock data for demo purposes (in case API rate limits are hit)
export const mockCurrencyData = {
  EUR_USD: { rate: 1.0867, fromCurrency: 'EUR', toCurrency: 'USD' },
  USD_JPY: { rate: 153.8900, fromCurrency: 'USD', toCurrency: 'JPY' },
  GBP_USD: { rate: 1.2537, fromCurrency: 'GBP', toCurrency: 'USD' },
  USD_CHF: { rate: 0.9048, fromCurrency: 'USD', toCurrency: 'CHF' },
  USD_CAD: { rate: 1.3652, fromCurrency: 'USD', toCurrency: 'CAD' },
  AUD_USD: { rate: 0.6604, fromCurrency: 'AUD', toCurrency: 'USD' }
};

export const mockStockData = [
  { symbol: 'AAPL', name: 'Apple Inc', price: 173.55, change: 0.67, changePercent: 0.39 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 406.32, change: 2.44, changePercent: 0.60 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 164.30, change: -1.25, changePercent: -0.76 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', price: 179.62, change: 1.43, changePercent: 0.80 },
  { symbol: 'META', name: 'Meta Platforms Inc', price: 474.99, change: 3.12, changePercent: 0.66 },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 177.67, change: -4.29, changePercent: -2.36 }
];

export const mockCryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 63248.15, change: 1234.56, changePercent: 1.99 },
  { symbol: 'ETH', name: 'Ethereum', price: 3076.22, change: 45.78, changePercent: 1.51 },
  { symbol: 'BNB', name: 'Binance Coin', price: 524.32, change: -12.43, changePercent: -2.32 },
  { symbol: 'SOL', name: 'Solana', price: 129.76, change: 2.45, changePercent: 1.92 },
  { symbol: 'XRP', name: 'Ripple', price: 0.4867, change: 0.0123, changePercent: 2.59 }
];