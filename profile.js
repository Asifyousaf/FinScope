import { supabase } from './src/supabase.js';

let currentUser = null;
let originalData = {};

// Initialize profile page
document.addEventListener('DOMContentLoaded', async function() {
  await checkAuth();
  await loadProfile();
  setupEventListeners();
  setupProfileAvatar();
});

// Check if user is authenticated
async function checkAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = 'login.html';
      return;
    }
    
    currentUser = session.user;
  } catch (error) {
    console.error('Error checking auth:', error);
    window.location.href = 'login.html';
  }
}

// Load user profile data
async function loadProfile() {
  if (!currentUser) return;
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    
    if (error) {
      console.error('Error loading profile:', error);
      showToast('Error loading profile data', 'error');
      return;
    }
    
    // Populate form fields
    document.getElementById('email').value = profile.email || '';
    document.getElementById('full_name').value = profile.full_name || '';
    
    // Store original data for comparison
    originalData = {
      email: profile.email || '',
      full_name: profile.full_name || ''
    };
    
    // Update account info
    document.getElementById('member-since').textContent = formatDate(profile.created_at);
    document.getElementById('last-updated').textContent = formatDate(profile.updated_at);
    
    // Update avatar
    updateProfileAvatar(profile.full_name);
    
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Error loading profile data', 'error');
  }
}

// Setup profile avatar
function setupProfileAvatar() {
  const avatarElement = document.getElementById('profile-avatar');
  if (!avatarElement) return;
  
  // Add hover effect
  avatarElement.addEventListener('mouseenter', () => {
    avatarElement.classList.add('transform', 'scale-105');
  });
  
  avatarElement.addEventListener('mouseleave', () => {
    avatarElement.classList.remove('transform', 'scale-105');
  });
}

// Update profile avatar with initials
function updateProfileAvatar(fullName) {
  const avatarElement = document.getElementById('profile-avatar');
  if (!avatarElement) return;
  
  const initials = fullName
    ? fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';
  
  avatarElement.textContent = initials;
}

// Setup event listeners
function setupEventListeners() {
  const form = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const fullNameInput = document.getElementById('full_name');
  
  form.addEventListener('submit', handleSaveProfile);
  logoutBtn.addEventListener('click', handleLogout);
  cancelBtn.addEventListener('click', handleCancel);
  
  // Update avatar in real-time as user types their name
  if (fullNameInput) {
    fullNameInput.addEventListener('input', (e) => {
      updateProfileAvatar(e.target.value);
    });
  }
}

// Handle profile save
async function handleSaveProfile(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('save-btn');
  const originalText = saveBtn.textContent;
  
  try {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    const formData = new FormData(e.target);
    const fullName = formData.get('full_name').trim();
    
    // Check if data has changed
    if (fullName === originalData.full_name) {
      showToast('No changes to save');
      return;
    }
    
    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);
    
    if (error) throw error;
    
    // Update original data
    originalData.full_name = fullName;
    
    showToast('Profile updated successfully!');
    
    // Reload profile to show updated timestamp
    await loadProfile();
    
  } catch (error) {
    console.error('Error saving profile:', error);
    showToast('Error saving profile. Please try again.', 'error');
  } finally {
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}

// Handle cancel button
function handleCancel() {
  // Reset form to original values
  document.getElementById('full_name').value = originalData.full_name;
  updateProfileAvatar(originalData.full_name);
  showToast('Changes cancelled');
}

// Handle logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error signing out:', error);
    showToast('Error signing out', 'error');
  }
}

// Format dates
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Toast notification
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