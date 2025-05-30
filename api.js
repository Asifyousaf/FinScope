// api.js - uses Financial Modeling Prep (FMP)
const FMP_API_KEY = 'N0HwEJMrIhfamTzYUWc5DDMdScZQlNfl';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Fetch multiple stock quotes
export async function getMajorStocks() {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  const res = await fetch(`${BASE_URL}/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`);
  return await res.json();
}

// Fetch major indices
export async function getMarketIndices() {
  // Replacing indices with their ETF equivalents used in FMP
  const symbols = ['SPY', 'DIA', 'QQQ', 'IWM']; // S&P 500, Dow, Nasdaq, Russell via ETFs
  const res = await fetch(`${BASE_URL}/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch indices');
  return await res.json();
}


// Fetch top cryptocurrencies
export async function getMajorCrypto() {
  const symbols = ['BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'ADAUSD'];
  const res = await fetch(`${BASE_URL}/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch crypto');
  return await res.json();
}

// Fetch top gainers & losers
export async function getMarketMovers() {
  const [gainersRes, losersRes] = await Promise.all([
    fetch(`${BASE_URL}/stock_market/gainers?apikey=${FMP_API_KEY}`),
    fetch(`${BASE_URL}/stock_market/losers?apikey=${FMP_API_KEY}`)
  ]);

  const gainers = await gainersRes.json();
  const losers = await losersRes.json();

  return {
    gainers: gainers.slice(0, 5),
    losers: losers.slice(0, 5)
  };
}

// Get financial news
export async function fetchFinancialNews(query = 'finance', pageSize = 10) {
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      return data.articles;
    } else {
      throw new Error(data.message || 'News API error');
    }
  } catch (error) {
    console.error('News fetch failed:', error);
    throw error;
  }
}

// Get stock time series for charts using FMP API
export async function fetchStockTimeSeries(symbol = 'AAPL', interval = '1hour') {
  const apiKey = 'N0HwEJMrIhfamTzYUWc5DDMdScZQlNfl';
  const url = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${symbol}?apikey=${apiKey}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (!Array.isArray(data)) throw new Error('Failed to fetch stock time series');

  // Reverse to oldest-to-latest
  return data.reverse().map(item => ({
    date: item.date,
    price: item.close
  }));
}

// Get crypto time series data for charts using FMP API
export async function fetchCryptoTimeSeries(symbol = 'BTCUSD', interval = '1hour') {
  const apiKey = 'N0HwEJMrIhfamTzYUWc5DDMdScZQlNfl';
  const url = `https://financialmodelingprep.com/api/v3/historical-chart/${interval}/${symbol}?apikey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!Array.isArray(data)) throw new Error('Failed to fetch crypto time series');

  // Reverse to oldest-to-latest
  return data.reverse().map(item => ({
    date: item.date,
    price: item.close
  }));
}
