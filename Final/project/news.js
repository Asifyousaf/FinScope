import { fetchFinancialNews } from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Load news categories
  initializeNewsCategories();
  
  // Load trending news
  await loadTrendingNews();
  
  // Load category news
  await loadCategoryNews('markets');
  
  // Setup search functionality
  setupNewsSearch();
});

// Initialize news categories
function initializeNewsCategories() {
  const categoriesElement = document.getElementById('news-categories');
  if (!categoriesElement) return;
  
  const categories = [
    { id: 'markets', name: 'Markets' },
    { id: 'stocks', name: 'Stocks' },
    { id: 'economy', name: 'Economy' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'forex', name: 'Forex' },
    { id: 'business', name: 'Business' }
  ];
  
  let categoriesHTML = '';
  categories.forEach(category => {
    categoriesHTML += `
      <button
        class="category-btn px-4 py-2 rounded-lg text-gold-400 border border-gold-500/30 hover:bg-gold-500/10"
        data-category="${category.id}"
      >
        ${category.name}
      </button>
    `;
  });
  
  categoriesElement.innerHTML = categoriesHTML;
  
  // Add event listeners to category buttons
  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-gold-500/20');
      });
      
      // Add active class to clicked button
      this.classList.add('bg-gold-500/20');
      
      // Load news for selected category
      loadCategoryNews(this.dataset.category);
    });
  });
  
  // Set first category as active
  document.querySelector('.category-btn').classList.add('bg-gold-500/20');
}

// Load trending news
async function loadTrendingNews() {
  const trendingNewsElement = document.getElementById('trending-news');
  if (!trendingNewsElement) return;
  
  trendingNewsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
  
  try {
    const articles = await fetchFinancialNews('financial markets', 6);
    renderNewsArticles(trendingNewsElement, articles, 'trending');
  } catch (error) {
    console.error('Error loading trending news:', error);
    trendingNewsElement.innerHTML = '<p class="text-red-500 text-center py-8">Failed to load trending news. Please try again later.</p>';
    
    // Load fallback data for demo
    loadFallbackNews(trendingNewsElement, 'trending');
  }
}

// Load category news
async function loadCategoryNews(category) {
  const categoryNewsElement = document.getElementById('category-news');
  if (!categoryNewsElement) return;
  
  // Update section title
  const categoryTitleElement = document.getElementById('category-title');
  if (categoryTitleElement) {
    categoryTitleElement.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  }
  
  categoryNewsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
  
  try {
    const articles = await fetchFinancialNews(`finance ${category}`, 8);
    renderNewsArticles(categoryNewsElement, articles, 'category');
  } catch (error) {
    console.error(`Error loading ${category} news:`, error);
    categoryNewsElement.innerHTML = `<p class="text-red-500 text-center py-8">Failed to load ${category} news. Please try again later.</p>`;
    
    // Load fallback data for demo
    loadFallbackNews(categoryNewsElement, 'category', category);
  }
}

// Render news articles
function renderNewsArticles(container, articles, type) {
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">No news articles found</p>';
    return;
  }
  
  let html = '';
  
  if (type === 'trending') {
    html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
    
    articles.forEach((article, index) => {
      const publishedDate = new Date(article.publishedAt);
      const formattedDate = publishedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      html += `
        <div class="glass glass-hover rounded-lg overflow-hidden">
          <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="block">
            <div class="relative h-40 overflow-hidden">
              <img 
                src="${article.urlToImage || 'https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350'}" 
                alt="${article.title}" 
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onerror="this.src='https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350'"
              />
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-gold-400 mb-2 line-clamp-2">${article.title}</h3>
              <p class="text-gray-300 text-sm mb-3 line-clamp-3">${article.description || ''}</p>
              <div class="flex justify-between items-center text-xs text-gray-400">
                <span>${article.source.name}</span>
                <span>${formattedDate}</span>
              </div>
            </div>
          </a>
        </div>
      `;
    });
    
    html += '</div>';
  } else {
    html = '<div class="space-y-4">';
    
    articles.forEach((article, index) => {
      const publishedDate = new Date(article.publishedAt);
      const formattedDate = publishedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      html += `
        <div class="glass glass-hover rounded-lg overflow-hidden">
          <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="block">
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/4 h-40 md:h-auto overflow-hidden">
                <img 
                  src="${article.urlToImage || 'https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350'}" 
                  alt="${article.title}" 
                  class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onerror="this.src='https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350'"
                />
              </div>
              <div class="md:w-3/4 p-4">
                <h3 class="font-semibold text-gold-400 mb-2">${article.title}</h3>
                <p class="text-gray-300 text-sm mb-3 line-clamp-2">${article.description || ''}</p>
                <div class="flex justify-between items-center text-xs text-gray-400">
                  <span>${article.source.name}</span>
                  <span>${formattedDate}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;
    });
    
    html += '</div>';
  }
  
  container.innerHTML = html;
}

// Setup news search
function setupNewsSearch() {
  const searchForm = document.getElementById('news-search-form');
  const searchInput = document.getElementById('news-search-input');
  const searchResultsElement = document.getElementById('search-results');
  
  if (!searchForm || !searchInput || !searchResultsElement) return;
  
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    // Show loading
    searchResultsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
    
    try {
      const articles = await fetchFinancialNews(query, 10);
      
      // Update search results title
      const searchTitleElement = document.getElementById('search-title');
      if (searchTitleElement) {
        searchTitleElement.textContent = `Search Results: ${query}`;
      }
      
      // Show search results section
      document.getElementById('search-section').classList.remove('hidden');
      
      // Scroll to search results
      document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
      
      renderNewsArticles(searchResultsElement, articles, 'category');
    } catch (error) {
      console.error('Error searching news:', error);
      searchResultsElement.innerHTML = '<p class="text-red-500 text-center py-8">Failed to search news. Please try again later.</p>';
      
      // Load fallback data for demo
      loadFallbackNews(searchResultsElement, 'search', query);
    }
  });
}

// Load fallback news data for demo
function loadFallbackNews(container, type, category = '') {
  const fallbackNews = [
    {
      title: 'Federal Reserve Holds Interest Rates Steady, Signals Future Cuts',
      description: 'The Federal Reserve maintained its benchmark interest rate, but indicated that rate cuts could be on the horizon as inflation pressures ease.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'Financial Times' },
      publishedAt: '2024-05-01T14:30:00Z'
    },
    {
      title: 'Global Markets Rally as Tech Stocks Lead Gains',
      description: 'Stock markets worldwide surged on Thursday, with technology shares leading the advance amid positive earnings reports from major tech companies.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/7567460/pexels-photo-7567460.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'Wall Street Journal' },
      publishedAt: '2024-05-02T09:45:00Z'
    },
    {
      title: 'Bitcoin Breaks $70,000 Barrier Amid Institutional Adoption',
      description: 'Bitcoin surpassed $70,000 for the first time, driven by increasing institutional investment and growing acceptance as a legitimate asset class.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'Bloomberg' },
      publishedAt: '2024-05-01T16:20:00Z'
    },
    {
      title: 'Oil Prices Fall as OPEC+ Considers Production Increase',
      description: 'Crude oil prices dropped on Wednesday following reports that OPEC+ members are discussing a potential increase in production quotas.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/247763/pexels-photo-247763.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'Reuters' },
      publishedAt: '2024-05-01T11:15:00Z'
    },
    {
      title: 'U.S. Economy Adds 280,000 Jobs in April, Exceeding Expectations',
      description: 'The U.S. labor market showed continued strength as employers added 280,000 jobs in April, surpassing economists\' forecasts and keeping unemployment at historic lows.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'CNBC' },
      publishedAt: '2024-05-03T13:45:00Z'
    },
    {
      title: 'European Central Bank Signals Interest Rate Cut in June',
      description: 'The ECB indicated it may lower interest rates at its June meeting, responding to easing inflation pressures across the eurozone.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/164474/pexels-photo-164474.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'The Economist' },
      publishedAt: '2024-05-02T15:30:00Z'
    },
    {
      title: 'Major Tech Company Announces $10 Billion AI Investment',
      description: 'A leading technology corporation unveiled plans to invest $10 billion in artificial intelligence research and development over the next five years.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'TechCrunch' },
      publishedAt: '2024-05-02T10:15:00Z'
    },
    {
      title: 'Global Supply Chain Constraints Easing, Report Finds',
      description: 'A new industry report indicates that global supply chain disruptions are gradually diminishing, potentially relieving inflation pressures.',
      url: '#',
      urlToImage: 'https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&h=350',
      source: { name: 'Supply Chain Digest' },
      publishedAt: '2024-05-01T08:45:00Z'
    }
  ];
  
  let articles = fallbackNews;
  
  // Filter by category if specified
  if (category && category !== 'markets') {
    const categoryKeywords = {
      stocks: ['stocks', 'market', 'rally', 'gains'],
      economy: ['economy', 'jobs', 'labor', 'inflation'],
      crypto: ['bitcoin', 'crypto'],
      forex: ['currency', 'euro', 'dollar', 'exchange'],
      business: ['company', 'corporate', 'business', 'investment']
    };
    
    const keywords = categoryKeywords[category] || [];
    if (keywords.length > 0) {
      articles = fallbackNews.filter(article => 
        keywords.some(keyword => 
          article.title.toLowerCase().includes(keyword) || 
          article.description.toLowerCase().includes(keyword)
        )
      );
    }
  }
  
  renderNewsArticles(container, articles, type);
}