document.addEventListener('DOMContentLoaded', function() {
  // Initialize login form
  initializeLoginForm();
  
  // Initialize registration form
  initializeRegistrationForm();
  
  // Set up form toggle
  setupFormToggle();
});

// Initialize login form
function initializeLoginForm() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const submitButton = document.getElementById('login-submit');
      
      if (!emailInput.value || !passwordInput.value) {
        showToast('Please enter both email and password', 'error');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      
      // Show loading state
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo, just redirect to dashboard
        showToast('Login successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        
      } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please check your credentials and try again.', 'error');
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
      }
    });
  }
}

// Initialize registration form
function initializeRegistrationForm() {
  const registrationForm = document.getElementById('register-form');
  
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('register-name');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      const confirmPasswordInput = document.getElementById('register-confirm-password');
      const submitButton = document.getElementById('register-submit');
      
      if (!nameInput.value || !emailInput.value || !passwordInput.value || !confirmPasswordInput.value) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      
      // Password validation
      if (passwordInput.value.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
      }
      
      // Confirm password
      if (passwordInput.value !== confirmPasswordInput.value) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      // Show loading state
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo, just redirect to dashboard
        showToast('Registration successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        
      } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again later.', 'error');
        submitButton.textContent = 'Create Account';
        submitButton.disabled = false;
      }
    });
  }
}

// Set up form toggle
function setupFormToggle() {
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const loginForm = document.getElementById('login-form-container');
  const registerForm = document.getElementById('register-form-container');
  
  if (loginLink && registerLink && loginForm && registerForm) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      
      registerLink.classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
      loginLink.classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
    });
    
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      
      loginLink.classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
      registerLink.classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
    });
  }
}