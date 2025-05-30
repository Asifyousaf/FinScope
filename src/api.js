// API Keys
const ALPHA_VANTAGE_KEY = 'RGHLGIFYBZMTCTFF';
const TWELVE_DATA_KEY = '6b49010b45c74440923790d98203c9e5';
const CMC_API_KEY = '478085d0-7f9b-44bb-9b5e-f88abf9f5a3a';

// Cache configuration
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const cache = new Map();

// Cache helper functions
function getCachedData(key) {
  const cachedItem = cache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Get stock quote data using Alpha Vantage
export async function fetchStockData(symbol) {
  const cacheKey = `stock_${symbol}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      const result = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: quote['07. latest trading day']
      };

      setCachedData(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    throw error;
  }
}

// Get multiple stocks data
export async function fetchMultipleStocks(symbols) {
  const results = [];
  for (const symbol of symbols) {
    try {
      const data = await fetchStockData(symbol);
      results.push(data);
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    }
  }
  return results;
}

// Get market indices
export async function getMarketIndices() {
  const indices = ['^GSPC', '^DJI', '^IXIC'];
  return fetchMultipleStocks(indices);
}

// Get major stocks
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  return fetchMultipleStocks(stocks);
}

// Get cryptocurrency data from CoinMarketCap
export async function getMajorCrypto() {
  const cacheKey = 'crypto_data';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY
      }
    });
    const data = await response.json();

    if (data.data) {
      const results = data.data.slice(0, 10).map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        change: crypto.quote.USD.percent_change_24h,
        volume: crypto.quote.USD.volume_24h,
        marketCap: crypto.quote.USD.market_cap
      }));

      setCachedData(cacheKey, results);
      return results;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to fetch crypto data:', error);
    throw error;
  }
}

// Get market movers using Alpha Vantage
export async function getMarketMovers() {
  const cacheKey = 'market_movers';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();

    if (data.top_gainers && data.top_losers) {
      const result = {
        gainers: data.top_gainers.slice(0, 5).map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', ''))
        })),
        losers: data.top_losers.slice(0, 5).map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage.replace('%', ''))
        }))
      };

      setCachedData(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to fetch market movers:', error);
    throw error;
  }
}

// Get stock time series data for charts
export async function fetchStockTimeSeries(symbol, interval = '1d') {
  const cacheKey = `timeseries_${symbol}_${interval}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=${TWELVE_DATA_KEY}`
    );
    const data = await response.json();

    if (data.values) {
      const result = data.values.map(item => ({
        date: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume)
      }));

      setCachedData(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to fetch time series data:', error);
    throw error;
  }
}