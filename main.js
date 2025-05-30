
// Main JavaScript for shared functionality across pages
import { supabase } from './src/supabase.js';

let currentUser = null;
let currentSession = null;

// Initialize auth state and profile dropdown
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing auth...');
  await initializeAuth();
  setupProfileDropdown();
  setupMobileMenu();
});

async function initializeAuth() {
  try {
    // Set up auth state listener FIRST
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      currentSession = session;
      currentUser = session?.user || null;
      await updateAuthUI();
    });

    // Then check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Initial session:', session);
    currentSession = session;
    currentUser = session?.user || null;
    await updateAuthUI();

  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}

async function updateAuthUI() {
  const loginLink = document.getElementById('login-link');
  const profileContainer = document.getElementById('profile-container');
  const mobileProfileSection = document.getElementById('mobile-profile-section');
  const mobileLoginSection = document.getElementById('mobile-login-section');
  
  console.log('Updating auth UI. User:', currentUser);
  
  if (currentUser && currentSession) {
    // User is logged in
    console.log('User is logged in, showing profile');
    
    // Hide login button
    if (loginLink) {
      loginLink.style.display = 'none';
    }
    
    // Hide mobile login section
    if (mobileLoginSection) {
      mobileLoginSection.style.display = 'none';
    }
    
    // Show desktop profile
    if (profileContainer) {
      profileContainer.style.display = 'flex';
      
      // Update profile name and email
      const nameSpan = document.getElementById('profile-name');
      const emailDiv = document.getElementById('profile-email');
      
      const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
      
      if (nameSpan) nameSpan.textContent = displayName;
      if (emailDiv) emailDiv.textContent = currentUser.email;
    }
    
    // Show mobile profile section
    if (mobileProfileSection) {
      mobileProfileSection.style.display = 'block';
      
      const mobileUserName = document.getElementById('mobile-user-name');
      const mobileUserEmail = document.getElementById('mobile-user-email');
      
      const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
      
      if (mobileUserName) mobileUserName.textContent = displayName;
      if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;
    }
    
  } else {
    // User is not logged in
    console.log('User not logged in, showing login button');
    
    // Show login button
    if (loginLink) {
      loginLink.style.display = 'inline-flex';
    }
    
    // Show mobile login section
    if (mobileLoginSection) {
      mobileLoginSection.style.display = 'block';
    }
    
    // Hide profile containers
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

    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  // Setup logout buttons (both desktop and mobile)
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
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local data
    currentUser = null;
    currentSession = null;
    
    // Update UI
    await updateAuthUI();
    
    // Show success message
    showToast('Successfully logged out');
    
  } catch (error) {
    console.error('Error signing out:', error);
    showToast('Error signing out', 'error');
  }
}

function setupMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
      const isOpen = mobileMenu.classList.contains('show');
      
      // Update aria-expanded
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
      
      // Update hamburger animation
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

  // Close mobile menu when clicking outside
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

// Global toast notification function
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

// Newsletter subscription functionality
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('email');
      const submitBtn = document.getElementById('subscribe-btn');
      const email = emailInput.value;
      
      if (!email) return;
      
      // Show loading state
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success toast
        window.showToast('Successfully subscribed!');
        emailInput.value = '';
      } catch (error) {
        // Show error toast
        window.showToast('Subscription failed. Please try again later.', 'error');
      } finally {
        submitBtn.textContent = 'Subscribe to Newsletter';
        submitBtn.disabled = false;
      }
    });
  }
});

// Utility functions
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
