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
  const symbols = ['^GSPC', '^DJI', '^IXIC', '^RUT']; // S&P 500, Dow, NASDAQ, Russell
  const res = await fetch(`${BASE_URL}/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`);
  return await res.json();
}

// Fetch top cryptocurrencies
export async function getMajorCrypto() {
  const res = await fetch(`${BASE_URL}/quotes/crypto?apikey=${FMP_API_KEY}`);
  const data = await res.json();
  return data.slice(0, 6); // only return first 6 for now
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

