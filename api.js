
// Financial data API service
// Using Alpha Vantage for stock/currency data and News API for news

const ALPHA_VANTAGE_API_KEY = 'Q1J2GM7L9WMRDS9A';
const NEWS_API_KEY = '1cb3fb8e7cb64f9f8c7130008c22820c';

// Backup currency rates in case API fails
export const mockCurrencyData = {
  'USD_EUR': { rate: 0.92 },
  'EUR_USD': { rate: 1.09 },
  'USD_GBP': { rate: 0.79 },
  'GBP_USD': { rate: 1.27 },
  'USD_JPY': { rate: 150.25 },
  'JPY_USD': { rate: 0.0067 }
};

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

// Get currency exchange rate
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
      throw new Error('Exchange rate not found');
    }
  } catch (error) {
    console.error('Currency API error:', error);
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

// Get historical price data for charts
export async function fetchStockTimeSeries(symbol, interval = 'daily') {
  let timeSeriesFunction;
  
  // Map interval to API function name
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
    
    // Find the time series key (it varies by function)
    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    
    if (data[timeSeriesKey]) {
      const timeSeriesData = data[timeSeriesKey];
      // Convert to array format for charts
      return Object.entries(timeSeriesData).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      throw new Error('No time series data available');
    }
  } catch (error) {
    console.error('Time series API error:', error);
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

// Get major market indices (S&P 500, Dow, etc.)
export async function getMarketIndices() {
  const indices = ['SPY', 'DIA', 'QQQ', 'IWM']; // ETFs that track major indices
  const promises = indices.map(symbol => fetchStockData(symbol));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Market indices fetch failed:', error);
    throw error;
  }
}

// Get major tech stocks
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  const promises = stocks.map(symbol => fetchStockData(symbol));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Major stocks fetch failed:', error);
    throw error;
  }
}

// Get popular cryptocurrencies
export async function getMajorCrypto() {
  const cryptos = ['BTC', 'ETH', 'LTC', 'XRP', 'ADA'];
  const promises = cryptos.map(symbol => fetchCryptoData(symbol));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Crypto data fetch failed:', error);
    throw error;
  }
}
