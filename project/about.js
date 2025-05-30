document.addEventListener('DOMContentLoaded', function() {
  // Initialize team member hover effects
  initializeTeamHover();
  
  // Initialize timeline animation
  initializeTimeline();
  
  // Initialize testimonial carousel
  initializeTestimonialCarousel();
});

// Initialize team member hover effects
function initializeTeamHover() {
  const teamMembers = document.querySelectorAll('.team-member');
  
  teamMembers.forEach(member => {
    member.addEventListener('mouseenter', function() {
      this.querySelector('.member-details').classList.add('opacity-100');
      this.querySelector('.member-details').classList.remove('opacity-0');
    });
    
    member.addEventListener('mouseleave', function() {
      this.querySelector('.member-details').classList.add('opacity-0');
      this.querySelector('.member-details').classList.remove('opacity-100');
    });
  });
}

// Initialize timeline animation
function initializeTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('timeline-item-visible');
      }
    });
  }, { threshold: 0.5 });
  
  timelineItems.forEach(item => {
    observer.observe(item);
  });
}

// Initialize testimonial carousel
function initializeTestimonialCarousel() {
  const testimonials = document.querySelectorAll('.testimonial');
  const nextButton = document.getElementById('testimonial-next');
  const prevButton = document.getElementById('testimonial-prev');
  const indicators = document.querySelectorAll('.testimonial-indicator');
  
  if (!testimonials.length) return;
  
  let currentIndex = 0;
  
  // Show testimonial at index
  function showTestimonial(index) {
    testimonials.forEach(testimonial => {
      testimonial.classList.add('hidden');
    });
    
    indicators.forEach(indicator => {
      indicator.classList.remove('bg-gold-500');
      indicator.classList.add('bg-gray-600');
    });
    
    testimonials[index].classList.remove('hidden');
    indicators[index].classList.remove('bg-gray-600');
    indicators[index].classList.add('bg-gold-500');
  }
  
  // Next testimonial
  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }
  
  // Previous testimonial
  function prevTestimonial() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentIndex);
  }
  
  // Set up click events
  if (nextButton) {
    nextButton.addEventListener('click', nextTestimonial);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', prevTestimonial);
  }
  
  // Set up indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentIndex = index;
      showTestimonial(currentIndex);
    });
  });
  
  // Auto advance every 5 seconds
  setInterval(nextTestimonial, 5000);
  
  // Show first testimonial
  showTestimonial(currentIndex);
}