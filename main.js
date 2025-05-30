
// TODO: maybe split this file later, getting pretty long...
import { supabase } from './src/supabase.js';

let currentUser = null;
let currentSession = null;

// Had to debug this for ages - turns out order matters here!
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Starting up the app...');
  await initializeAuth();
  setupProfileDropdown();
  setupMobileMenu();
});

async function initializeAuth() {
  try {
    // This listener needs to be set up BEFORE checking session
    // learned this the hard way when auth wasn't working
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth changed:', event, session?.user?.email || 'no user');
      currentSession = session;
      currentUser = session?.user || null;
      await updateAuthUI();
    });

    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Got session on load:', session?.user?.email || 'none');
    currentSession = session;
    currentUser = session?.user || null;
    await updateAuthUI();

  } catch (error) {
    console.error('Auth setup failed:', error);
  }
}

async function updateAuthUI() {
  const loginLink = document.getElementById('login-link');
  const profileContainer = document.getElementById('profile-container');
  const mobileProfileSection = document.getElementById('mobile-profile-section');
  const mobileLoginSection = document.getElementById('mobile-login-section');
  
  console.log('Updating UI for user:', currentUser?.email || 'not logged in');
  
  if (currentUser && currentSession) {
    // User is authenticated - show profile stuff
    console.log('Showing profile UI');
    
    // Hide the login button
    if (loginLink) {
      loginLink.style.display = 'none';
    }
    
    if (mobileLoginSection) {
      mobileLoginSection.style.display = 'none';
    }
    
    // Show desktop profile dropdown
    if (profileContainer) {
      profileContainer.style.display = 'flex';
      
      const nameSpan = document.getElementById('profile-name');
      const emailDiv = document.getElementById('profile-email');
      
      // Try to get name from metadata, fallback to email username
      const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
      
      if (nameSpan) nameSpan.textContent = displayName;
      if (emailDiv) emailDiv.textContent = currentUser.email;
    }
    
    // Mobile profile section
    if (mobileProfileSection) {
      mobileProfileSection.style.display = 'block';
      
      const mobileUserName = document.getElementById('mobile-user-name');
      const mobileUserEmail = document.getElementById('mobile-user-email');
      
      const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
      
      if (mobileUserName) mobileUserName.textContent = displayName;
      if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;
    }
    
  } else {
    // No user logged in - show login options
    console.log('No user, showing login UI');
    
    if (loginLink) {
      loginLink.style.display = 'inline-flex';
    }
    
    if (mobileLoginSection) {
      mobileLoginSection.style.display = 'block';
    }
    
    // Hide profile stuff
    if (profileContainer) {
      profileContainer.style.display = 'none';
    }
    
    if (mobileProfileSection) {
      mobileProfileSection.style.display = 'none';
    }
  }
}

function setupProfileDropdown() {
  const profileButton = document.getElementById('profile-button');
  const profileDropdown = document.getElementById('profile-dropdown');
  
  if (profileButton && profileDropdown) {
    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // Logout functionality for both desktop and mobile
  const logoutBtns = document.querySelectorAll('#logout-btn, #mobile-logout-btn');
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleLogout();
      });
    }
  });
}

async function handleLogout() {
  try {
    console.log('Logging out user...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear everything
    currentUser = null;
    currentSession = null;
    
    await updateAuthUI();
    
    showToast('Logged out successfully');
    
  } catch (error) {
    console.error('Logout failed:', error);
    showToast('Error logging out', 'error');
  }
}

function setupMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
      const isOpen = mobileMenu.classList.contains('show');
      
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
      
      // Animate the hamburger icon
      const spans = hamburgerBtn.querySelectorAll('span');
      spans.forEach(span => {
        if (isOpen) {
          span.classList.add('active');
        } else {
          span.classList.remove('active');
        }
      });
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('show')) {
      const isClickInside = mobileMenu.contains(e.target) || 
                          hamburgerBtn.contains(e.target);
      
      if (!isClickInside) {
        mobileMenu.classList.remove('show');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        const spans = hamburgerBtn.querySelectorAll('span');
        spans.forEach(span => span.classList.remove('active'));
      }
    }
  });
}

// Make toast function global so other files can use it
window.showToast = function(message, type = 'success') {
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
};

// Newsletter signup - probably should move this to its own file
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('email');
      const submitBtn = document.getElementById('subscribe-btn');
      const email = emailInput.value;
      
      if (!email) return;
      
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;
      
      try {
        // Fake delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        window.showToast('Successfully subscribed!');
        emailInput.value = '';
      } catch (error) {
        window.showToast('Subscription failed. Please try again later.', 'error');
      } finally {
        submitBtn.textContent = 'Subscribe to Newsletter';
        submitBtn.disabled = false;
      }
    });
  }
});

// Utility functions that I use throughout the app
window.formatCurrency = function(number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

window.formatPercentage = function(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number / 100);
};

window.formatDate = function(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

window.formatTime = function(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

window.formatDateTime = function(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// Debounce function for search inputs
window.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
