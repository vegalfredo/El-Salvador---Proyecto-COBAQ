/* ================================================================
   VOCES QUE CRUZAN FRONTERAS — script.js
   Trabajo escolar COBAQ · Querétaro, México
================================================================ */

'use strict';

// ── Utility ──────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Navbar: scroll effect + active link ──────────────────────
(function initNavbar() {
  const navbar = $('#navbar');
  const links  = $$('.nav-link');
  const sections = $$('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Highlight active nav link based on scroll position
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });

  // Smooth scroll for nav links
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        $('#navLinks').classList.remove('open');
        $('#menuToggle').classList.remove('open');
      }
    });
  });
})();

// ── Mobile menu toggle ────────────────────────────────────────
(function initMobileMenu() {
  const toggle = $('#menuToggle');
  const menu   = $('#navLinks');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });
})();

// ── Intersection Observer: Reveal animations ─────────────────
(function initReveal() {
  const elements = $$('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.style.getPropertyValue('--delay') || '0s';
        setTimeout(() => {
          el.classList.add('visible');
        }, parseFloat(delay) * 1000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ── Animated bar fills ────────────────────────────────────────
(function initBarFills() {
  const fills = $$('.bar-fill, .age-fill');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(el => observer.observe(el));
})();

// ── Animated counters ─────────────────────────────────────────
(function initCounters() {
  const counters = $$('.stat-number[data-target]');
  const seen = new Set();

  const formatNumber = (n, prefix, suffix, origText) => {
    // Return the original display text once done
    return origText;
  };

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target  = +el.dataset.target;
    const prefix  = el.dataset.prefix  || '';
    const suffix  = el.dataset.suffix  || '';
    const origText = el.textContent;
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);

      // Format with commas
      const formatted = current.toLocaleString('es-MX');

      // Custom display for very large numbers
      if (target >= 1000000) {
        const m = (eased * (target / 1000000)).toFixed(1);
        el.textContent = `${prefix}${m}M`;
      } else if (target >= 1000 && suffix !== '%') {
        el.textContent = `${prefix}${formatted}${suffix}`;
      } else {
        el.textContent = `${prefix}${formatted}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = origText; // restore original clean text
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        setTimeout(() => animateCounter(entry.target), 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ── Stories slider ────────────────────────────────────────────
(function initSlider() {
  const track = $('#historiasTrack');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const dotsContainer = $('#sliderDots');
  if (!track) return;

  const cards = $$('.historia-card', track);
  const total = cards.length;
  let current = 0;
  let autoTimer;

  const goTo = (index) => {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    $$('.dot', dotsContainer).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  };

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Dot click
  $$('.dot', dotsContainer).forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Auto-advance
  const startAuto = () => {
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  }, { passive: true });

  startAuto();
})();

// ── Hero particles ────────────────────────────────────────────
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const NUM = 28;
  for (let i = 0; i < NUM; i++) {
    const p = document.createElement('span');
    const size = Math.random() * 3 + 1;
    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = Math.random() * 8 + 6;
    const del  = Math.random() * 6;
    const colors = ['#1a8a50', '#22c55e', '#f59e0b', '#4ade80', '#3b82f6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    Object.assign(p.style, {
      position:   'absolute',
      left:       `${x}%`,
      top:        `${y}%`,
      width:      `${size}px`,
      height:     `${size}px`,
      borderRadius: '50%',
      background: color,
      opacity:    (Math.random() * 0.4 + 0.1).toString(),
      animation:  `particleFloat ${dur}s ${del}s ease-in-out infinite`,
    });
    container.appendChild(p);
  }

  // Inject keyframes
  if (!document.getElementById('particleStyle')) {
    const style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent = `
      @keyframes particleFloat {
        0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.15; }
        33%       { transform: translateY(-30px) translateX(12px) scale(1.2); opacity: 0.4; }
        66%       { transform: translateY(20px) translateX(-10px) scale(0.9); opacity: 0.2; }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ── Smooth CTA button micro-interaction ───────────────────────
(function initButtonFX() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function(e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        width: '6px',
        height: '6px',
        background: 'rgba(255,255,255,0.3)',
        left: x + 'px',
        top:  y + 'px',
        transform: 'scale(0)',
        animation: 'btnRipple 0.5s ease-out forwards',
        pointerEvents: 'none',
      });
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  if (!document.getElementById('btnRippleStyle')) {
    const style = document.createElement('style');
    style.id = 'btnRippleStyle';
    style.textContent = `
      @keyframes btnRipple {
        to { transform: scale(20); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ── Scroll-based page progress bar ───────────────────────────
(function initProgressBar() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'fixed',
    top: '70px',
    left: '0',
    height: '2px',
    width: '0%',
    background: 'linear-gradient(90deg, #1a8a50, #22c55e, #f59e0b)',
    zIndex: '999',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// ── Stat card tilt effect on hover (desktop only) ─────────────
(function initTilt() {
  if (window.innerWidth < 768) return;

  $$('.stat-card, .crisis-card, .ayudar-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-6px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, box-shadow 0.3s, border-color 0.3s';
    });
  });
})();

// ── Typing effect on hero title ───────────────────────────────
(function initHeroEntrance() {
  const lines = $$('.title-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(30px)';
    line.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'none';
    }, 300 + i * 160);
  });

  const tag = $('.hero-tag');
  const sub = $('.hero-sub');
  const ctas = $('.hero-ctas');
  [tag, sub, ctas].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, 100 + i * 200);
  });
})();

// ── Console credits ───────────────────────────────────────────
console.log('%c🌍 Voces que Cruzan Fronteras', 'font-size:18px;font-weight:bold;color:#1a8a50;');
console.log('%cTrabajo escolar · COBAQ · Querétaro · 2025', 'font-size:12px;color:#94a3b8;');
console.log('%cDatos verificados: BCR El Salvador, OIM, Pew Research Center, Censo 2024', 'font-size:11px;color:#475569;');
