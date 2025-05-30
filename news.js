
document.addEventListener('DOMContentLoaded', async function() {
  initializeNewsCategories();
  await loadTrendingNews();
  await loadCategoryNews('markets');
  setupNewsSearch();
});

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
  
  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-gold-500/20');
      });
      
      this.classList.add('bg-gold-500/20');
      loadCategoryNews(this.dataset.category);
    });
  });
  
  document.querySelector('.category-btn').classList.add('bg-gold-500/20');
}

async function loadTrendingNews() {
  const trendingNewsElement = document.getElementById('trending-news');
  if (!trendingNewsElement) return;
  
  trendingNewsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
  
  // Load fallback financial news for demo
  const articles = getFinancialNews('trending', 6);
  renderNewsArticles(trendingNewsElement, articles, 'trending');
}

async function loadCategoryNews(category) {
  const categoryNewsElement = document.getElementById('category-news');
  if (!categoryNewsElement) return;
  
  const categoryTitleElement = document.getElementById('category-title');
  if (categoryTitleElement) {
    categoryTitleElement.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  }
  
  categoryNewsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
  
  // Load fallback financial news for demo
  const articles = getFinancialNews(category, 8);
  renderNewsArticles(categoryNewsElement, articles, 'category');
}

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
                src="${article.urlToImage}" 
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
                  src="${article.urlToImage}" 
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

function setupNewsSearch() {
  const searchForm = document.getElementById('news-search-form');
  const searchInput = document.getElementById('news-search-input');
  const searchResultsElement = document.getElementById('search-results');
  
  if (!searchForm || !searchInput || !searchResultsElement) return;
  
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    searchResultsElement.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>';
    
    const searchTitleElement = document.getElementById('search-title');
    if (searchTitleElement) {
      searchTitleElement.textContent = `Search Results: ${query}`;
    }
    
    document.getElementById('search-section').classList.remove('hidden');
    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
    
    const articles = getFinancialNews('search', 10);
    renderNewsArticles(searchResultsElement, articles, 'category');
  });
}

// Financial news data for demo purposes
function getFinancialNews(category, limit = 10) {
  const financialNews = [
    {
      title: "Federal Reserve Holds Interest Rates Steady, Signals Future Cuts",
      description: "The Federal Reserve maintained its benchmark interest rate, but indicated that rate cuts could be on the horizon as inflation pressures ease.",
      url: "https://www.reuters.com/markets/us/fed-holds-rates-steady-signals-cuts-coming-2024-03-20/",
      urlToImage: "https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Financial Times" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Global Markets Rally as Tech Stocks Lead Gains",
      description: "Stock markets worldwide surged today, with technology shares leading the advance amid positive earnings reports from major tech companies.",
      url: "https://www.bloomberg.com/markets",
      urlToImage: "https://images.pexels.com/photos/7567460/pexels-photo-7567460.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Wall Street Journal" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Bitcoin Breaks $70,000 Barrier Amid Institutional Adoption",
      description: "Bitcoin surpassed $70,000 for the first time, driven by increasing institutional investment and growing acceptance as a legitimate asset class.",
      url: "https://www.coindesk.com/markets",
      urlToImage: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Bloomberg" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Oil Prices Fall as OPEC+ Considers Production Increase",
      description: "Crude oil prices dropped following reports that OPEC+ members are discussing a potential increase in production quotas.",
      url: "https://www.reuters.com/markets/commodities",
      urlToImage: "https://images.pexels.com/photos/247763/pexels-photo-247763.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Reuters" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "U.S. Economy Adds 280,000 Jobs, Exceeding Expectations",
      description: "The U.S. labor market showed continued strength as employers added 280,000 jobs, surpassing economists' forecasts.",
      url: "https://www.cnbc.com/economy/",
      urlToImage: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "CNBC" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "European Central Bank Signals Interest Rate Cut in June",
      description: "The ECB indicated it may lower interest rates at its June meeting, responding to easing inflation pressures across the eurozone.",
      url: "https://www.ft.com/markets",
      urlToImage: "https://images.pexels.com/photos/164474/pexels-photo-164474.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "The Economist" },
      publishedAt: new Date().toISOString()
    }
  ];
  
  return financialNews.slice(0, limit);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  if (type === 'error') {
    toast.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    toast.style.color = '#ef4444';
  } else {
    toast.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    toast.style.color = '#f59e0b';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
