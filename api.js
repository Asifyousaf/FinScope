
// Financial data API service
// Using Alpha Vantage as and backup , using api.frankfurter.app for currency data and News API for news

const ALPHA_VANTAGE_API_KEY = 'Q1J2GM7L9WMRDS9A';
const NEWS_API_KEY = '1cb3fb8e7cb64f9f8c7130008c22820c';


// Get stock quote data
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
      throw new Error('No stock data found');
    }
  } catch (error) {
    console.error('Failed to get stock data for', symbol, ':', error);
    throw error;
  }
}



// Get crypto data (Bitcoin, Ethereum, etc.)
export async function fetchCryptoData(symbol, market = 'USD') {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_INTRADAY&symbol=${symbol}&market=${market}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data['Time Series (Digital Currency Intraday)']) {
      const timeSeries = data['Time Series (Digital Currency Intraday)'];
      const latestTime = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestTime];
      
      return {
        symbol: symbol,
        name: data['Meta Data']['3. Digital Currency Name'],
        price: parseFloat(latestData[`1a. price (${market})`]),
        volume: parseFloat(latestData['5. volume']),
        lastRefreshed: data['Meta Data']['6. Last Refreshed']
      };
    } else {
      throw new Error('Crypto data not available');
    }
  } catch (error) {
    console.error('Crypto API failed:', error);
    throw error;
  }
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

// Search for stock symbols
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
      throw new Error('Symbol search failed');
    }
  } catch (error) {
    console.error('Symbol search error:', error);
    throw error;
  }
}



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
