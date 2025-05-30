
// Financial data API service
// Using Yahoo Finance (via RapidAPI), CoinMarketCap, and Frankfurter APIs

// API Keys - Replace these with your actual API keys
const CMC_API_KEY = '478085d0-7f9b-44bb-9b5e-f88abf9f5a3a'; // CoinMarketCap API key
const YAHOO_API_KEY = '871a958b5cmshcf7953cd1ed6594p19be62jsn18b679fc3696'; // Yahoo Finance RapidAPI key

// Yahoo Finance API base URL
const YAHOO_BASE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo';

// Yahoo Finance API headers
const YAHOO_HEADERS = {
  'X-RapidAPI-Key': YAHOO_API_KEY,
  'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
};

// Get stock quote data using Yahoo Finance API
export async function fetchStockData(symbol) {
  try {
    console.log(`Fetching Yahoo Finance stock data for: ${symbol}`);
    const response = await fetch(`${YAHOO_BASE_URL}/qu/quote/${symbol}`, {
      method: 'GET',
      headers: YAHOO_HEADERS
    });
    const data = await response.json();
    
    console.log(`Yahoo Finance stock data response for ${symbol}:`, data);
    
    // Check if we have valid stock data from Yahoo Finance
    if (data && data.regularMarketPrice) {
      return {
        symbol: data.symbol,
        name: data.longName || data.shortName || symbol,
        price: parseFloat(data.regularMarketPrice),
        change: parseFloat(data.regularMarketChange) || 0,
        changePercent: parseFloat(data.regularMarketChangePercent) || 0,
        volume: parseInt(data.regularMarketVolume) || 0,
        lastUpdated: new Date().toISOString()
      };
    } else {
      throw new Error(`No Yahoo Finance stock data found for ${symbol}`);
    }
  } catch (error) {
    console.error('Failed to get Yahoo Finance stock data for', symbol, ':', error);
    throw error;
  }
}

// Get multiple stocks data using Yahoo Finance batch request
export async function fetchMultipleStocks(symbols) {
  try {
    console.log('Fetching multiple stocks from Yahoo Finance:', symbols);
    const results = [];
    
    // Yahoo Finance API doesn't support batch requests, so we'll make individual calls
    for (const symbol of symbols) {
      try {
        const stockData = await fetchStockData(symbol);
        results.push(stockData);
      } catch (error) {
        console.error(`Failed to fetch data for ${symbol}:`, error);
        // Continue with other symbols even if one fails
      }
    }
    
    console.log('Yahoo Finance multiple stocks results:', results);
    return results;
  } catch (error) {
    console.error('Failed to get multiple stocks data from Yahoo Finance:', error);
    throw error;
  }
}

// Get market trending stocks using Yahoo Finance API
export async function getTrendingStocks() {
  try {
    console.log('Fetching trending stocks from Yahoo Finance...');
    const response = await fetch(`${YAHOO_BASE_URL}/tr/trending`, {
      method: 'GET',
      headers: YAHOO_HEADERS
    });
    const data = await response.json();
    
    console.log('Yahoo Finance trending stocks response:', data);
    
    // Process trending stocks data
    if (data && data.finance && data.finance.result && data.finance.result[0]) {
      const quotes = data.finance.result[0].quotes;
      return quotes.slice(0, 10).map(stock => ({
        symbol: stock.symbol,
        name: stock.longName || stock.shortName || stock.symbol,
        price: parseFloat(stock.regularMarketPrice) || 0,
        change: parseFloat(stock.regularMarketChange) || 0,
        changePercent: parseFloat(stock.regularMarketChangePercent) || 0,
        volume: parseInt(stock.regularMarketVolume) || 0,
        lastUpdated: new Date().toISOString()
      }));
    } else {
      throw new Error('No trending stocks data available from Yahoo Finance');
    }
  } catch (error) {
    console.error('Yahoo Finance trending stocks fetch failed:', error);
    throw error;
  }
}

// Get market movers (gainers and losers) using Yahoo Finance API
export async function getMarketMovers() {
  try {
    console.log('Fetching market movers from Yahoo Finance...');
    
    // Get top gainers
    const gainersResponse = await fetch(`${YAHOO_BASE_URL}/sc/screener`, {
      method: 'POST',
      headers: {
        ...YAHOO_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "size": 10,
        "sortField": "percentchange",
        "sortType": "DESC",
        "quoteType": "EQUITY",
        "topOperator": "AND",
        "query": {
          "operator": "AND",
          "operands": [
            {
              "operator": "gt",
              "operands": ["dayvolume", 100000]
            }
          ]
        }
      })
    });
    
    const gainersData = await gainersResponse.json();
    console.log('Yahoo Finance gainers response:', gainersData);
    
    const gainers = gainersData.quotes ? gainersData.quotes.slice(0, 5).map(stock => ({
      symbol: stock.symbol,
      name: stock.longName || stock.shortName || stock.symbol,
      price: parseFloat(stock.regularMarketPrice) || 0,
      change: parseFloat(stock.regularMarketChange) || 0,
      changePercent: parseFloat(stock.regularMarketChangePercent) || 0,
      volume: parseInt(stock.regularMarketVolume) || 0,
      lastUpdated: new Date().toISOString()
    })) : [];
    
    return { gainers, losers: [] }; // For now, just return gainers
  } catch (error) {
    console.error('Yahoo Finance market movers fetch failed:', error);
    throw error;
  }
}

// Get currency exchange rate using Frankfurter API (public, no key required)
export async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    console.log(`Converting ${fromCurrency} to ${toCurrency} using Frankfurter API`);
    const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
    const data = await response.json();
    
    console.log('Frankfurter exchange rate response:', data);
    
    // Check if we have valid exchange rate data
    if (data.rates && data.rates[toCurrency]) {
      return {
        rate: data.rates[toCurrency],
        lastRefreshed: data.date,
        fromCurrencyCode: fromCurrency,
        toCurrencyCode: toCurrency
      };
    } else {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
  } catch (error) {
    console.error('Currency API error:', error);
    throw error;
  }
}

// Get cryptocurrency data from CoinMarketCap API
export async function fetchCryptoData(symbol) {
  try {
    console.log(`Fetching CoinMarketCap crypto data for: ${symbol}`);
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log(`CoinMarketCap crypto data response for ${symbol}:`, data);
    
    // Check if we have valid crypto data
    if (data.data && data.data[symbol]) {
      const crypto = data.data[symbol];
      return {
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        volume: crypto.quote.USD.volume_24h,
        change: crypto.quote.USD.percent_change_24h,
        lastRefreshed: crypto.last_updated
      };
    } else {
      throw new Error(`CoinMarketCap crypto data not available for ${symbol}`);
    }
  } catch (error) {
    console.error('CoinMarketCap crypto API failed:', error);
    throw error;
  }
}

// Get stock time series data using Yahoo Finance API for charts
export async function fetchStockTimeSeries(symbol, interval = '1d', range = '1mo') {
  try {
    console.log(`Fetching Yahoo Finance time series for ${symbol}, interval: ${interval}, range: ${range}`);
    const response = await fetch(`${YAHOO_BASE_URL}/hi/history/${symbol}?interval=${interval}&range=${range}`, {
      method: 'GET',
      headers: YAHOO_HEADERS
    });
    const data = await response.json();
    
    console.log(`Yahoo Finance time series response for ${symbol}:`, data);
    
    // Check if we have valid time series data
    if (data && data.prices && Array.isArray(data.prices)) {
      return {
        symbol: symbol,
        values: data.prices.map(item => ({
          date: new Date(item.date * 1000).toISOString().split('T')[0],
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume) || 0
        }))
      };
    } else {
      throw new Error(`No Yahoo Finance time series data found for ${symbol}`);
    }
  } catch (error) {
    console.error('Failed to get Yahoo Finance time series data for', symbol, ':', error);
    throw error;
  }
}

// Get major market indices using Yahoo Finance
export async function getMarketIndices() {
  const indices = ['^GSPC', '^IXIC', '^DJI', '^RUT']; // S&P 500, NASDAQ, Dow, Russell 2000
  try {
    console.log('Fetching market indices from Yahoo Finance...');
    return await fetchMultipleStocks(indices);
  } catch (error) {
    console.error('Yahoo Finance market indices fetch failed:', error);
    throw error;
  }
}

// Get major tech and popular stocks using Yahoo Finance
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  try {
    console.log('Fetching major stocks from Yahoo Finance...');
    return await fetchMultipleStocks(stocks);
  } catch (error) {
    console.error('Yahoo Finance major stocks fetch failed:', error);
    throw error;
  }
}

// Get top cryptocurrencies using CoinMarketCap API
export async function getMajorCrypto() {
  try {
    console.log('Fetching top cryptocurrencies from CoinMarketCap...');
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log('CoinMarketCap response:', data);
    
    // Check if we have valid cryptocurrency listings
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        volume: crypto.quote.USD.volume_24h,
        change: crypto.quote.USD.percent_change_24h,
        lastRefreshed: crypto.last_updated
      }));
    } else {
      throw new Error('CoinMarketCap crypto data not available');
    }
  } catch (error) {
    console.error('CoinMarketCap crypto data fetch failed:', error);
    throw error;
  }
}

// Get global cryptocurrency market statistics from CoinMarketCap
export async function getGlobalMarketStats() {
  try {
    console.log('Fetching global market statistics from CoinMarketCap...');
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log('CoinMarketCap global market stats response:', data);
    
    // Check if we have valid global market data
    if (data.data) {
      return {
        totalMarketCap: data.data.quote.USD.total_market_cap,
        totalVolume: data.data.quote.USD.total_volume_24h,
        btcDominance: data.data.btc_dominance,
        activeCryptocurrencies: data.data.active_cryptocurrencies,
        activeExchanges: data.data.active_exchanges
      };
    } else {
      throw new Error('CoinMarketCap global market data not available');
    }
  } catch (error) {
    console.error('CoinMarketCap global market data fetch failed:', error);
    throw error;
  }
}

// Search for stock symbols using Yahoo Finance
export async function searchSymbol(keywords) {
  try {
    console.log(`Searching for symbol using Yahoo Finance: ${keywords}`);
    const response = await fetch(`${YAHOO_BASE_URL}/se/search?q=${keywords}`, {
      method: 'GET',
      headers: YAHOO_HEADERS
    });
    const data = await response.json();
    
    console.log('Yahoo Finance symbol search response:', data);
    
    // Check if we have valid search results
    if (data && data.quotes && Array.isArray(data.quotes)) {
      return data.quotes.slice(0, 10).map(match => ({
        symbol: match.symbol,
        name: match.longname || match.shortname || match.symbol,
        type: match.typeDisp || 'Stock',
        exchange: match.exchange,
        currency: 'USD',
        country: 'US'
      }));
    } else {
      throw new Error('Yahoo Finance symbol search failed');
    }
  } catch (error) {
    console.error('Yahoo Finance symbol search error:', error);
    throw error;
  }
}

// Get financial news (using mock data for now since you wanted real APIs focused on market data)
export async function fetchFinancialNews(query, limit = 10) {
  // Mock news data - in production you'd use a real news API
  console.log('Fetching financial news...');
  const mockNews = [
    {
      title: "Markets Rally on Strong Economic Data",
      description: "Stock markets surged today following positive economic indicators and better-than-expected corporate earnings reports.",
      url: "https://example.com/news1",
      urlToImage: "https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Financial Times" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Cryptocurrency Market Update",
      description: "Bitcoin and major altcoins show strong performance amid growing institutional adoption and regulatory clarity.",
      url: "https://example.com/news2", 
      urlToImage: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "CoinDesk" },
      publishedAt: new Date().toISOString()
    }
  ];
  
  return mockNews.slice(0, limit);
}
