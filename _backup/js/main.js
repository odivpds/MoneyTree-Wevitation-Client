/* ============================================
   UNDANGAN BALI — Main JavaScript
   Global interactions, navbar, scroll animations,
   template filters, testimonial slider
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initBackToTop();
  initTestimonialSlider();
  initTemplateFilters();
});

/* --- Navbar --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (!navbar) return;

  // Scroll effect
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      // Only remove on pages that don't have scrolled by default
      if (!navbar.dataset.alwaysScrolled) {
        navbar.classList.remove('scrolled');
      }
    }
  };

  // Check if navbar should always be scrolled (non-homepage)
  if (navbar.classList.contains('scrolled')) {
    navbar.dataset.alwaysScrolled = 'true';
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* --- Scroll Reveal Animations --- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if (!revealElements.length) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* --- Back to Top Button --- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Testimonial Slider --- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dots = document.getElementById('testimonialDots');
  
  if (!track || !dots) return;

  let currentSlide = 0;
  const slides = track.children;
  const totalSlides = slides.length;
  const dotButtons = dots.querySelectorAll('button');

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dotButtons.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  dotButtons.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  // Auto-advance every 5 seconds
  setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, 5000);
}

/* --- Template Filters (Gallery Page) --- */
function initTemplateFilters() {
  const filterBar = document.getElementById('filterBar');
  const searchInput = document.getElementById('searchInput');
  const templateGrid = document.getElementById('templateGrid');
  const emptyState = document.getElementById('emptyState');

  if (!filterBar || !templateGrid) return;

  const filterButtons = filterBar.querySelectorAll('.filter-btn');
  const cards = templateGrid.querySelectorAll('.template-card');

  let activeFilter = 'semua';

  // Filter by category
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      applyFilters();
    }, 300));
  }

  function applyFilters() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.dataset.category;
      const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';

      const matchCategory = activeFilter === 'semua' || category === activeFilter;
      const matchSearch = !searchQuery || name.includes(searchQuery);

      if (matchCategory && matchSearch) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide empty state
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
}

// Reset filters function (called from empty state button)
function resetFilters() {
  const filterBar = document.getElementById('filterBar');
  const searchInput = document.getElementById('searchInput');
  
  if (filterBar) {
    const buttons = filterBar.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    buttons[0].classList.add('active');
  }
  
  if (searchInput) {
    searchInput.value = '';
  }

  const templateGrid = document.getElementById('templateGrid');
  if (templateGrid) {
    templateGrid.querySelectorAll('.template-card').forEach(card => {
      card.style.display = '';
    });
  }

  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

/* --- Utility: Debounce --- */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* --- Utility: Show Toast --- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.className = `toast toast--${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* --- Smooth Scroll for Anchor Links --- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});
