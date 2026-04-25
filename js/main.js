/* =============================================================
   DREAMLAB STUDIO - main.js
   ============================================================= */

const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    heroBg.poster = 'assets/img/hero-poster-mobile.jpg';
    document.getElementById('heroSrc').src = 'video/hero-mobile.mp4';
    heroBg.load();
  }
  heroBg.play().catch(() => {});
}
const bookForm = document.getElementById('bookForm');
const formSuccess = document.getElementById('formSuccess');

/* 1. NAV - scroll border
   ============================================================= */
function updateNavState() {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateNavState, { passive: true });
updateNavState();

/* 2. NAV - highlight active section link
   ============================================================= */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav__link');

function updateActiveLink() {
  const offset = nav.offsetHeight + 80;
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY + offset >= sec.offsetTop) current = sec.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

/* 3. MOBILE MENU - fullscreen overlay
   ============================================================= */
function openMenu() {
  hamburger.classList.add('is-open');
  navLinks.classList.add('is-open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('is-open');
  navLinks.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
});

// Close on any nav link click
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* 4. SMOOTH SCROLL
   ============================================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* 5. HERO PARALLAX
   ============================================================= */
function heroParallax() {
  if (!heroBg || window.scrollY >= window.innerHeight) return;
  heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
}
window.addEventListener('scroll', heroParallax, { passive: true });

/* 6. SCROLL ANIMATIONS (IntersectionObserver)
   ============================================================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

function observeRevealElements(selector, delayFn = index => index * 0.1) {
  document.querySelectorAll(selector).forEach((el, index) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${delayFn(index)}s`;
    revealObserver.observe(el);
  });
}

document.querySelectorAll('section').forEach(section => {
  section.classList.add('fade-up');
  revealObserver.observe(section);
});

observeRevealElements('.section-header, .portfolio__filters, .about__image-col, .about__content, .book__info, .book__form-col, .book__map');
observeRevealElements('.bento__cell', index => (index % 2) * 0.1);
observeRevealElements('.service-card');
observeRevealElements('.stat');
observeRevealElements('.book__detail');

const portfolioGrid = document.getElementById('portfolioGrid');

function getPortfolioColumnCount() {
  if (!portfolioGrid) return 1;
  return getComputedStyle(portfolioGrid).gridTemplateColumns.split(' ').length || 1;
}

function applyPortfolioStagger() {
  const columns = getPortfolioColumnCount();
  document.querySelectorAll('.portfolio__item').forEach((item, index) => {
    item.classList.add('fade-up');
    item.style.transitionDelay = `${(index % columns) * 0.1}s`;
    revealObserver.observe(item);
  });
}

applyPortfolioStagger();

/* 7. PORTFOLIO FILTER
   ============================================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio__item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    portfolioItems.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.category === filter;

      if (match) {
        item.classList.remove('is-hidden');
        // Re-trigger fade-up so items animate in after filter
        item.classList.remove('is-visible');
        const columns = getPortfolioColumnCount();
        item.style.transitionDelay = `${(i % columns) * 0.1}s`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => item.classList.add('is-visible'))
        );
      } else {
        item.classList.add('is-hidden');
      }
    });
  });
});

/* 8. GLIGHTBOX INIT
   ============================================================= */
if (typeof GLightbox !== 'undefined') {
  GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
    openEffect: 'fade',
    closeEffect: 'fade',
  });
}

/* 9. CONTACT FORM - Netlify Forms via fetch (no page reload)
   ============================================================= */
if (bookForm) {
  bookForm.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = bookForm.querySelector('[type="submit"]');
    const origLabel = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(bookForm);
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (!res.ok) {
        bookForm.submit();
        return;
      }

      bookForm.reset();
      formSuccess.classList.add('is-visible');
      setTimeout(() => formSuccess.classList.remove('is-visible'), 7000);
    } catch {
      bookForm.submit();
    } finally {
      submitBtn.textContent = origLabel;
      submitBtn.disabled = false;
    }
  });
}

window.addEventListener('resize', applyPortfolioStagger, { passive: true });
