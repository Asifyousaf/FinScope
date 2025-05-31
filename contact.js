
document.addEventListener('DOMContentLoaded', function() {
  initializeContactForm();
  initializeFAQs();
  initializeOfficeLocations();
});

// Contact form functionality
function initializeContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');
      const submitButton = document.getElementById('contact-submit');
      
      // Check required fields
      if (!nameInput.value || !emailInput.value || !messageInput.value) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      
      // Show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        // Simulate sending message (replace with real API later)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast('Your message has been sent successfully! We\'ll get back to you soon.');
        
        // Clear the form
        contactForm.reset();
      } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message. Please try again later.', 'error');
      } finally {
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
      }
    });
  }
}

// FAQ accordion functionality
function initializeFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');
    
    header.addEventListener('click', function() {
      // Toggle this FAQ
      content.classList.toggle('hidden');
      
      // Update icon based on state
      if (content.classList.contains('hidden')) {
        // Closed - show plus icon
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>';
      } else {
        // Open - show minus icon
        icon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>';
      }
      
      // Close all other FAQs (accordion behavior)
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          
          otherContent.classList.add('hidden');
          otherIcon.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>';
        }
      });
    });
  });
}

// Office locations data and rendering
function initializeOfficeLocations() {
  // Office data - could move this to a separate file if it gets bigger
  const officeLocations = [
    {
      city: 'Dubai',
      address: '123 Finance Street, Suite 400, Jumeriah Street, Dubai, UAE',
      phone: '+1 (212) 555-1234',
      email: 'newyork@finscope.com'
    },
    {
      city: 'London',
      address: '45 Trading Lane, Floor 3, London, EC2N 1HQ, UK',
      phone: '+44 20 7123 4567',
      email: 'london@finscope.com'
    },
    {
      city: 'Singapore',
      address: '8 Marina View, #12-05, Asia Square Tower 1, Singapore 018960',
      phone: '+65 6123 4567',
      email: 'singapore@finscope.com'
    },
    {
      city: 'Hong Kong',
      address: '88 Queens Road, Central Tower, Level 35, Hong Kong',
      phone: '+852 3123 4567',
      email: 'hongkong@finscope.com'
    }
  ];
  
  const officesElement = document.getElementById('office-locations');
  if (!officesElement) return;
  
  // Build HTML for offices
  let officesHTML = '';
  officeLocations.forEach(office => {
    officesHTML += `
      <div class="glass glass-hover rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gold-400 mb-2">${office.city}</h3>
        <div class="space-y-2 text-gray-300">
          <p>${office.address}</p>
          <p>
            <span class="text-gold-400">Phone:</span> ${office.phone}
          </p>
          <p>
            <span class="text-gold-400">Email:</span> 
            <a href="mailto:${office.email}" class="hover:text-gold-400 transition-colors">${office.email}</a>
          </p>
        </div>
      </div>
    `;
  });
  
  officesElement.innerHTML = officesHTML;
}
