const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('primary-navigation');
const header = document.querySelector('header');

// ========== NAVIGATION & MENU ==========
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    menuToggle.classList.toggle('open', isActive);
    menuToggle.setAttribute('aria-expanded', isActive);
    // prevent body scroll when mobile menu open
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // close any open mega parents
      document.querySelectorAll('.nav-links li.has-mega.open').forEach(p => p.classList.remove('open'));
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuToggle) {
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
      document.querySelectorAll('.nav-links li.has-mega.open').forEach(p => p.classList.remove('open'));
    });
  });
}

// Close menus and restore scroll on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    if (navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      if (menuToggle) {
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }
    // close any open mega menu parents
    document.querySelectorAll('.nav-links li.has-mega.open').forEach(p => {
      p.classList.remove('open');
      const link = p.querySelector('a');
      const panel = p.querySelector('.mega-menu');
      if (link) link.setAttribute('aria-expanded', 'false');
      if (panel) panel.setAttribute('aria-hidden', 'true');
    });
  }
});

// ========== ANALYTICS HELPER ==========
function analyticsTrack(action, params = {}) {
  try {
    if (window.gtag) {
      window.gtag('event', action, params);
      return;
    }
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      const payload = Object.assign({ event: action }, params);
      window.dataLayer.push(payload);
      return;
    }
  } catch (e) {
    // ignore
  }
  console.log('analytics:fallback', action, params);
}

// ========== MEGA MENU (desktop) ==========
document.addEventListener('DOMContentLoaded', () => {
  const megaParents = document.querySelectorAll('.nav-links li.has-mega');
  megaParents.forEach(parent => {
    const link = parent.querySelector('a');
    const panel = parent.querySelector('.mega-menu');

    // pointer hover for desktop
    parent.addEventListener('mouseenter', () => {
      parent.classList.add('open');
      if (panel) panel.setAttribute('aria-hidden', 'false');
      if (link) link.setAttribute('aria-expanded', 'true');
    });
    parent.addEventListener('mouseleave', () => {
      parent.classList.remove('open');
      if (panel) panel.setAttribute('aria-hidden', 'true');
      if (link) link.setAttribute('aria-expanded', 'false');
    });

    // keyboard accessibility
    if (link) {
      link.addEventListener('focus', () => {
        parent.classList.add('open');
        if (panel) panel.setAttribute('aria-hidden', 'false');
        link.setAttribute('aria-expanded', 'true');
      });
      link.addEventListener('blur', () => {
        setTimeout(() => {
          if (!parent.contains(document.activeElement)) {
            parent.classList.remove('open');
            if (panel) panel.setAttribute('aria-hidden', 'true');
            link.setAttribute('aria-expanded', 'false');
          }
        }, 100);
      });
    }

    // touch devices: toggle on click
    if (link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 980) return; // mobile overlay handles links
        e.preventDefault();
        const isOpen = parent.classList.toggle('open');
        if (panel) panel.setAttribute('aria-hidden', String(!isOpen));
        link.setAttribute('aria-expanded', isOpen);
      });
    }
  });
});

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

    // Populate hidden UTM/referrer fields
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || '';
      const utmMedium = params.get('utm_medium') || '';
      const utmCampaign = params.get('utm_campaign') || '';
      const utmSourceField = document.getElementById('utm_source');
      const utmMediumField = document.getElementById('utm_medium');
      const utmCampaignField = document.getElementById('utm_campaign');
      const refField = document.getElementById('referrer');
      if (utmSourceField) utmSourceField.value = utmSource;
      if (utmMediumField) utmMediumField.value = utmMedium;
      if (utmCampaignField) utmCampaignField.value = utmCampaign;
      if (refField) refField.value = document.referrer || '';
    } catch (err) {
      // ignore
    }

    // File attachment validation
    const attachmentInput = document.getElementById('attachment');
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','application/zip'];
    if (attachmentInput) {
      attachmentInput.addEventListener('change', () => {
        const file = attachmentInput.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          showFormError('attachment', 'File must be 5MB or smaller');
          attachmentInput.value = '';
        } else if (!allowed.includes(file.type)) {
          showFormError('attachment', 'Unsupported file type');
          attachmentInput.value = '';
        } else {
          clearFormError('attachment');
        }
      });
    }

    // Mailto preview button
    const mailtoBtn = document.getElementById('mailto-btn');
    if (mailtoBtn) {
      mailtoBtn.addEventListener('click', () => {
        const nameVal = fullName ? fullName.value.trim() : '';
        const emailVal = email ? email.value.trim() : '';
        const phoneVal = phone ? phone.value.trim() : '';
        const messageVal = message ? message.value.trim() : '';
        const subject = encodeURIComponent('Project Inquiry - 4Force Developers');
        const body = encodeURIComponent(`Name: ${nameVal}\nEmail: ${emailVal}\nPhone: ${phoneVal}\n\nMessage:\n${messageVal}`);
        window.open(`mailto:dukembusyo@gmail.com?subject=${subject}&body=${body}`);
      });
    }

    // Scheduling (Calendly) embed lazy-load
    const scheduleBtn = document.getElementById('schedule-btn');
    const calendlyEmbed = document.getElementById('calendly-embed');
    if (scheduleBtn && calendlyEmbed) {
      scheduleBtn.addEventListener('click', () => {
        const url = scheduleBtn.getAttribute('data-calendly') || 'https://calendly.com/4force-developers/30min';
        if (calendlyEmbed.style.display === 'none' || !calendlyEmbed.innerHTML.trim()) {
          calendlyEmbed.innerHTML = `<iframe src="${url}" title="Schedule meeting" loading="lazy"></iframe>`;
          calendlyEmbed.style.display = 'block';
          calendlyEmbed.setAttribute('aria-hidden', 'false');
          scheduleBtn.setAttribute('aria-expanded', 'true');
          calendlyEmbed.scrollIntoView({ behavior: 'smooth' });
        } else {
          calendlyEmbed.style.display = 'none';
          calendlyEmbed.setAttribute('aria-hidden', 'true');
          scheduleBtn.setAttribute('aria-expanded', 'false');
        }
        analyticsTrack('open_calendly');
      });
    }

    // Lazy-load map embed
    const mapBtn = document.getElementById('map-load-btn');
    const mapContainer = document.getElementById('map-container');
    if (mapBtn && mapContainer) {
      mapBtn.addEventListener('click', () => {
        if (!mapContainer.innerHTML.trim()) {
          mapContainer.innerHTML = `<iframe src="https://maps.google.com/maps?q=Nairobi&z=13&output=embed" title="Map - Nairobi" loading="lazy"></iframe>`;
          mapContainer.style.display = 'block';
          mapContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          mapContainer.style.display = mapContainer.style.display === 'none' ? 'block' : 'none';
        }
        analyticsTrack('toggle_map');
      });
    }

    // CTA analytics for contact form buttons
    document.querySelectorAll('#contact-form .btn').forEach(b => b.addEventListener('click', () => {
      analyticsTrack('contact_cta', { label: b.textContent.trim() });
    }));
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
  // keyboard: Escape closes overlays (already handled earlier) and add arrows for nav
  document.addEventListener('keydown', (e) => {
    // Escape: close mobile overlay and any open mega menus
    if (e.key === 'Escape') {
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (menuToggle) {
          menuToggle.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
      document.querySelectorAll('.nav-links li.has-mega.open').forEach(p => {
        p.classList.remove('open');
        const link = p.querySelector('a');
        if (link) link.setAttribute('aria-expanded', 'false');
        const panel = p.querySelector('.mega-menu');
        if (panel) panel.setAttribute('aria-hidden', 'true');
      });
      return;
    }

    // Arrow key navigation for top-level items when focus is inside the nav
    const activeEl = document.activeElement;
    if (!activeEl) return;
    const topLevelLinks = Array.from(document.querySelectorAll('.nav-links > li > a'));
    const currentIndex = topLevelLinks.indexOf(activeEl);

    if (currentIndex !== -1) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = topLevelLinks[(currentIndex + 1) % topLevelLinks.length];
        next.focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = topLevelLinks[(currentIndex - 1 + topLevelLinks.length) % topLevelLinks.length];
        prev.focus();
      }
      if (e.key === 'ArrowDown') {
        const parent = activeEl.closest('li.has-mega');
        if (parent) {
          e.preventDefault();
          parent.classList.add('open');
          const panel = parent.querySelector('.mega-menu');
          if (panel) {
            panel.setAttribute('aria-hidden', 'false');
            activeEl.setAttribute('aria-expanded', 'true');
            const first = panel.querySelector('a');
            if (first) first.focus();
          }
        }
      }
    }
  });

  // ========== PRICING TOGGLE (monthly / annual) ==========
  const billingToggle = document.getElementById('billing-toggle');
  if (billingToggle) {
    const priceEls = document.querySelectorAll('[data-monthly][data-annual]');
    function updatePrices(isAnnual) {
      priceEls.forEach(el => {
        const monthly = el.getAttribute('data-monthly');
        const annual = el.getAttribute('data-annual');
        el.textContent = isAnnual ? annual : monthly;
      });
    }
    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      updatePrices(isAnnual);
      document.querySelectorAll('.package-card').forEach(c => {
        c.classList.add('pulse');
        setTimeout(() => c.classList.remove('pulse'), 600);
      });
    });
    // initialize
    updatePrices(billingToggle.checked);
  }

  // Savings calculator logic and analytics hooks
  const savingsBtn = document.getElementById('calc-button');
  const planSelect = document.getElementById('savings-plan');
  const savingsOutput = document.getElementById('savings-output');
  function parsePrice(str) {
    if (!str) return null;
    const m = String(str).match(/(\d+[\d,]*)/);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
  }
  if (savingsBtn && planSelect && savingsOutput) {
    savingsBtn.addEventListener('click', () => {
      const plan = planSelect.value;
      const planEl = document.querySelector(`#plan-${plan.toLowerCase()} .price`);
      if (!planEl) return;
      const monthlyStr = planEl.getAttribute('data-monthly');
      const annualStr = planEl.getAttribute('data-annual');
      const monthly = parsePrice(monthlyStr);
      const annual = parsePrice(annualStr);
      if (monthly && annual) {
        const yearlyCostIfMonthly = monthly * 12;
        const saving = yearlyCostIfMonthly - annual;
        const percent = Math.round((saving / yearlyCostIfMonthly) * 100);
        savingsOutput.textContent = `Save $${saving} (${percent}%) per year`;
      } else {
        savingsOutput.textContent = 'Contact us for custom pricing';
      }

      // basic analytics hook
      analyticsTrack('calculate_saving', { plan });
    });
  }

  // CTA click analytics for pricing cards
  document.querySelectorAll('.package-card a').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.package-card');
      const plan = card ? card.getAttribute('data-plan') : 'unknown';
      analyticsTrack('pricing_cta_click', { plan, href: btn.getAttribute('href') });
    });
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980 && navLinks) {
    navLinks.classList.remove('active');
    if (menuToggle) {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
    // ensure mega menus reset
    document.querySelectorAll('.nav-links li.has-mega.open').forEach(p => p.classList.remove('open'));
  }
});
