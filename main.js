// Main JavaScript for shared functionality across pages
import { supabase } from './src/supabase.js';

// Initialize auth state and profile dropdown
document.addEventListener('DOMContentLoaded', async function() {
  await checkAuthState();
  setupProfileDropdown();
});

async function checkAuthState() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const loginLink = document.getElementById('login-link');
    const profileContainer = document.getElementById('profile-container');
    
    // Add placeholder elements to prevent layout shift
    if (loginLink) loginLink.style.visibility = 'hidden';
    if (profileContainer) profileContainer.style.visibility = 'hidden';
    
    if (session) {
      if (loginLink) {
        loginLink.style.display = 'none';
        loginLink.style.visibility = 'visible';
      }
      
      if (profileContainer) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();
          
        profileContainer.style.display = 'flex';
        profileContainer.style.visibility = 'visible';
        
        const nameSpan = document.getElementById('profile-name');
        const emailDiv = document.getElementById('profile-email');
        
        if (nameSpan) nameSpan.textContent = profile?.full_name || 'User';
        if (emailDiv) emailDiv.textContent = session.user.email;
      }
    } else {
      if (loginLink) {
        loginLink.style.display = 'flex';
        loginLink.style.visibility = 'visible';
      }
      if (profileContainer) {
        profileContainer.style.display = 'none';
        profileContainer.style.visibility = 'visible';
      }
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
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

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase.auth.token');
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Error signing out:', error);
        showToast('Error signing out', 'error');
      }
    });
  }
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

// Format currency
window.formatCurrency = function(number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

// Format percentage
window.formatPercentage = function(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number / 100);
};

// Format date
window.formatDate = function(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Format time
window.formatTime = function(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

// Format date and time
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
        window.showToast('Successfully subscribed! You\'ll receive the latest financial updates in your inbox.');
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

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});

 // Setup mobile menu
 const mobileMenuBtn = document.getElementById('mobile-menu-btn');
 const mobileMenu = document.getElementById('mobile-menu');
 
 if (mobileMenuBtn && mobileMenu) {
   mobileMenuBtn.addEventListener('click', () => {
     mobileMenu.classList.toggle('show');
     const isOpen = mobileMenu.classList.contains('show');
     
     // Update aria-expanded
     mobileMenuBtn.setAttribute('aria-expanded', isOpen);
     
     // Update icon
     const icon = mobileMenuBtn.querySelector('.menu-icon');
     if (icon) {
       icon.innerHTML = isOpen 
         ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
         : `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
     }
   });
 }

 // Close mobile menu when clicking outside
 document.addEventListener('click', (e) => {
   if (mobileMenu && mobileMenu.classList.contains('show')) {
     const isClickInside = mobileMenu.contains(e.target) || 
                         mobileMenuBtn.contains(e.target);
     
     if (!isClickInside) {
       mobileMenu.classList.remove('show');
       mobileMenuBtn.setAttribute('aria-expanded', 'false');
       const icon = mobileMenuBtn.querySelector('.menu-icon');
       if (icon) {
         icon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
       }
     }
   }
 });