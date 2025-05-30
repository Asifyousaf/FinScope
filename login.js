
import { supabase } from './src/supabase.js';

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  initializeLoginForm();
  initializeRegistrationForm();
  setupFormToggle();
});

async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

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
      
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.value.trim(),
          password: passwordInput.value
        });

        if (error) throw error;

        showToast('Login successful! Redirecting...');
        
        // Small delay to show the success message
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        
      } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Invalid email or password', 'error');
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
      }
    });
  }
}

async function initializeRegistrationForm() {
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
      
      if (passwordInput.value !== confirmPasswordInput.value) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      if (passwordInput.value.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }
      
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailInput.value.trim(),
          password: passwordInput.value,
          options: {
            data: {
              full_name: nameInput.value.trim()
            }
          }
        });

        if (authError) throw authError;

        if (authData.user && !authData.session) {
          showToast('Registration successful! Please check your email to confirm your account.');
          setTimeout(() => {
            switchToLoginForm();
          }, 3000);
        } else if (authData.session) {
          showToast('Registration successful! Redirecting...');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
        submitButton.textContent = 'Create Account';
        submitButton.disabled = false;
      }
    });
  }
}

function setupFormToggle() {
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const toRegisterLink = document.getElementById('to-register');
  const toLoginLink = document.getElementById('to-login');
  
  [loginLink, registerLink, toRegisterLink, toLoginLink].forEach(link => {
    if (link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.id === 'login-link' || this.id === 'to-login') {
          switchToLoginForm();
        } else {
          switchToRegisterForm();
        }
      });
    }
  });
}

function switchToLoginForm() {
  document.getElementById('login-form-container').classList.remove('hidden');
  document.getElementById('register-form-container').classList.add('hidden');
  document.getElementById('login-link').classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
  document.getElementById('register-link').classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
}

function switchToRegisterForm() {
  document.getElementById('login-form-container').classList.add('hidden');
  document.getElementById('register-form-container').classList.remove('hidden');
  document.getElementById('login-link').classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
  document.getElementById('register-link').classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
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
