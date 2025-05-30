
// #i updated the import path to use the correct supabase client
import { supabase } from './src/supabase.js';

// #i kept the DOM ready function simple for beginners to understand
document.addEventListener('DOMContentLoaded', function() {
  console.log('Login page loaded'); // #i added this to help debug if page loads
  
  // #i check if user is already logged in and redirect them
  checkAuthStatus();
  
  // #i initialize both forms
  initializeLoginForm();
  initializeRegistrationForm();
  setupFormToggle();
});

// #i added this function to check if user is already authenticated
async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // #i redirect to dashboard if already logged in
      console.log('User already logged in, redirecting to dashboard');
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.log('Error checking auth status:', error);
  }
}

// #i made this function simple - it handles the login form submission
async function initializeLoginForm() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // #i prevent the default form submission
      
      // #i get the form inputs in a simple way
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const submitButton = document.getElementById('login-submit');
      
      // #i check if both fields are filled before proceeding
      if (!emailInput.value || !passwordInput.value) {
        showToast('Please enter both email and password', 'error');
        return;
      }
      
      // #i show loading spinner while processing
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        console.log('Attempting to sign in user'); // #i log for debugging
        
        // #i use supabase to sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        });

        if (error) {
          console.error('Login error:', error); // #i log the full error
          throw error;
        }

        console.log('Login successful:', data); // #i log success for debugging
        
        // #i show success message and redirect to dashboard
        showToast('Login successful! Redirecting to dashboard...');
        
        // #i wait a moment then redirect
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
        
      } catch (error) {
        console.error('Login error:', error); // #i log errors for debugging
        
        // #i provide user-friendly error messages
        let errorMessage = 'Login failed. Please try again.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before logging in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait before trying again.';
        }
        
        showToast(errorMessage, 'error');
        
        // #i reset the button back to normal state
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
      }
    });
  }
}

// #i made this function simple - it handles the registration form submission
async function initializeRegistrationForm() {
  const registrationForm = document.getElementById('register-form');
  
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // #i prevent the default form submission
      
      // #i get all the registration form inputs
      const nameInput = document.getElementById('register-name');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      const confirmPasswordInput = document.getElementById('register-confirm-password');
      const submitButton = document.getElementById('register-submit');
      
      // #i check if all fields are filled
      if (!nameInput.value || !emailInput.value || !passwordInput.value || !confirmPasswordInput.value) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      
      // #i validate the email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      
      // #i check if password is strong enough
      if (passwordInput.value.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }
      
      // #i check if passwords match
      if (passwordInput.value !== confirmPasswordInput.value) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      // #i show loading spinner
      submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>';
      submitButton.disabled = true;
      
      try {
        console.log('Attempting to create new user account'); // #i log for debugging
        
        // #i use supabase to create new user account with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailInput.value.trim(),
          password: passwordInput.value,
          options: {
            data: {
              full_name: nameInput.value.trim()
            }
          }
        });

        if (authError) {
          console.error('Registration error:', authError); // #i log the full error
          throw authError;
        }

        console.log('Registration successful:', authData); // #i log success for debugging
        
        // #i check if user needs to confirm email
        if (authData.user && !authData.session) {
          showToast('Registration successful! Please check your email to confirm your account before logging in.');
          
          // #i switch to login form after email confirmation message
          setTimeout(() => {
            switchToLoginForm();
          }, 3000);
        } else {
          // #i user is automatically logged in
          showToast('Registration successful! Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        }
        
      } catch (error) {
        console.error('Registration error:', error); // #i log errors for debugging
        
        // #i provide user-friendly error messages
        let errorMessage = 'Registration failed. Please try again.';
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        showToast(errorMessage, 'error');
        
        // #i reset the button back to normal state
        submitButton.textContent = 'Create Account';
        submitButton.disabled = false;
      }
    });
  }
}

// #i made this function simple - it switches between login and register forms
function setupFormToggle() {
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  
  if (loginLink && registerLink) {
    // #i handle click on login tab
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchToLoginForm();
    });
    
    // #i handle click on register tab
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchToRegisterForm();
    });
  }
  
  // #i also handle the footer links for switching forms
  const toRegisterLink = document.getElementById('to-register');
  const toLoginLink = document.getElementById('to-login');
  
  if (toRegisterLink) {
    toRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchToRegisterForm();
    });
  }
  
  if (toLoginLink) {
    toLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchToLoginForm();
    });
  }
}

// #i created this helper function to switch to login form
function switchToLoginForm() {
  const loginForm = document.getElementById('login-form-container');
  const registerForm = document.getElementById('register-form-container');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  
  if (loginForm && registerForm && loginLink && registerLink) {
    // #i hide register form and show login form
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    
    // #i update the tab styling
    registerLink.classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
    registerLink.classList.add('text-gray-300');
    loginLink.classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
    loginLink.classList.remove('text-gray-300');
  }
}

// #i created this helper function to switch to register form
function switchToRegisterForm() {
  const loginForm = document.getElementById('login-form-container');
  const registerForm = document.getElementById('register-form-container');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  
  if (loginForm && registerForm && loginLink && registerLink) {
    // #i hide login form and show register form
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    
    // #i update the tab styling
    loginLink.classList.remove('text-gold-400', 'border-b-2', 'border-gold-400');
    loginLink.classList.add('text-gray-300');
    registerLink.classList.add('text-gold-400', 'border-b-2', 'border-gold-400');
    registerLink.classList.remove('text-gray-300');
  }
}
