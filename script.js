const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('primary-navigation');
const header = document.querySelector('header');

// ========== NAVIGATION & MENU ==========
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ========== HEADER SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ========== FORM VALIDATION ==========
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s+()-]*$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

function showFormError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add('error');
    let errorMsg = field.parentElement.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'error-message';
      field.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.setAttribute('aria-live', 'polite');
  }
}

function clearFormError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('error');
    const errorMsg = field.parentElement.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
  }
}

// ========== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ==========
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  // Observe cards and sections for fade-in animation
  document.querySelectorAll('.card, .testimonial-card, .case-card, .showcase-item, section').forEach(el => {
    observer.observe(el);
  });

  // ========== COUNTER ANIMATIONS ==========
  const counters = document.querySelectorAll('[data-count]');
  let countStarted = false;
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countStarted) {
        countStarted = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'));
          const increment = target / 50;
          let current = 0;
          
          const updateCount = () => {
            current += increment;
            if (current < target) {
              counter.textContent = Math.floor(current) + '+';
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = target + '+';
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ========== YEAR UPDATE ==========
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ========== CONTACT FORM VALIDATION & SUBMISSION ==========
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Real-time validation
    const fullName = document.getElementById('full-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const message = document.getElementById('message');

    if (fullName) {
      fullName.addEventListener('blur', () => {
        if (fullName.value.trim().length < 2) {
          showFormError('full-name', 'Name must be at least 2 characters');
        } else {
          clearFormError('full-name');
        }
      });
    }

    if (email) {
      email.addEventListener('blur', () => {
        if (!validateEmail(email.value)) {
          showFormError('email', 'Please enter a valid email address');
        } else {
          clearFormError('email');
        }
      });
    }

    if (phone) {
      phone.addEventListener('blur', () => {
        if (phone.value && !validatePhone(phone.value)) {
          showFormError('phone', 'Please enter a valid phone number');
        } else {
          clearFormError('phone');
        }
      });
    }

    // Form submission with validation
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = fullName ? fullName.value.trim() : '';
      const emailVal = email ? email.value.trim() : '';
      const phoneVal = phone ? phone.value.trim() : '';
      const messageVal = message ? message.value.trim() : '';
      
      let isValid = true;

      if (!nameVal || nameVal.length < 2) {
        showFormError('full-name', 'Please enter your name');
        isValid = false;
      }
      if (!emailVal || !validateEmail(emailVal)) {
        showFormError('email', 'Please enter a valid email');
        isValid = false;
      }
      if (phoneVal && !validatePhone(phoneVal)) {
        showFormError('phone', 'Please enter a valid phone number');
        isValid = false;
      }
      if (!messageVal || messageVal.length < 10) {
        showFormError('message', 'Message must be at least 10 characters');
        isValid = false;
      }

      if (isValid) {
        const subject = encodeURIComponent('Project Inquiry - 4Force Developers');
        const body = encodeURIComponent(
          `Name: ${nameVal}\nEmail: ${emailVal}\nPhone: ${phoneVal}\n\nMessage:\n${messageVal}`
        );
        window.location.href = `mailto:dukembusyo@gmail.com?subject=${subject}&body=${body}`;
        
        const successMsg = document.getElementById('success-message');
        if (successMsg) {
          successMsg.classList.remove('hidden');
          successMsg.setAttribute('role', 'alert');
          successMsg.setAttribute('aria-live', 'assertive');
        }
        contactForm.reset();
        setTimeout(() => {
          if (successMsg) successMsg.classList.add('hidden');
        }, 5000);
      }
    });
  }

  // ========== BLOG SEARCH & FILTERING ==========
  const searchInput = document.getElementById('blog-search');
  const categoryFilter = document.getElementById('category-filter');
  const blogArticles = document.querySelectorAll('[data-category]');

  function filterBlogPosts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    let visibleCount = 0;
    blogArticles.forEach(article => {
      const title = article.querySelector('h3')?.textContent.toLowerCase() || '';
      const excerpt = article.querySelector('p')?.textContent.toLowerCase() || '';
      const category = article.getAttribute('data-category');

      const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        article.style.display = 'grid';
        visibleCount++;
      } else {
        article.style.display = 'none';
      }
    });

    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterBlogPosts);
  if (categoryFilter) categoryFilter.addEventListener('change', filterBlogPosts);

  // ========== LAZY LOADING IMAGES ==========
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }

  // ========== ACCESSIBILITY: SKIP LINK ==========
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.removeAttribute('tabindex');
      }
    });
  }

  // ========== KEYBOARD NAVIGATION ==========
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinks) {
    navLinks.classList.remove('active');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }
});
