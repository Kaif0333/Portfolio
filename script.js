const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
if (hasGSAP && hasScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  ringX: window.innerWidth / 2,
  ringY: window.innerHeight / 2,
  blobX: window.innerWidth / 2,
  blobY: window.innerHeight / 2,
  blobScale: 1,
  blobTargetScale: 1
};

const loader = qs('#loader');
const sectionTransition = qs('.section-transition');
const topButton = qs('#to-top');
const progressBar = qs('#scroll-progress-bar');
const menuBtn = qs('#menu-btn');
const siteNav = qs('#site-nav');
const themeToggle = qs('#theme-toggle');
const langToggle = qs('#lang-toggle');
const caseModal = qs('#case-modal');
const cmdk = qs('#cmdk');
let lenisInstance = null;
let tabHidden = document.hidden;

const ensureCursorBlob = () => {
  let blob = qs('.cursor-distort');
  if (!blob) {
    blob = document.createElement('div');
    blob.className = 'cursor-distort';
    blob.setAttribute('aria-hidden', 'true');
    document.body.appendChild(blob);
  }
  return blob;
};

const cursorDot = qs('.cursor-dot');
const cursorRing = qs('.cursor-ring');
const cursorBlob = ensureCursorBlob();
const ANALYTICS_KEY = 'portfolio_events';

const I18N = {
  en: {
    now_title: 'What I am currently focused on',
    now_learning_h: 'Learning',
    now_learning_p: 'Deepening system-design thinking for distributed backends and improving observability patterns for production services.',
    now_building_h: 'Building',
    now_building_p: 'Practical AI-assisted API systems with secure auth, async processing, and measurable runtime performance improvements.',
    testimonials_title: 'What collaborators say'
  },
  hi: {
    now_title: 'मैं अभी किन चीजों पर फोकस कर रहा हूं',
    now_learning_h: 'सीखना',
    now_learning_p: 'डिस्ट्रिब्यूटेड बैकएंड के लिए सिस्टम-डिज़ाइन और प्रोडक्शन ऑब्ज़र्वेबिलिटी पैटर्न को गहरा कर रहा हूं।',
    now_building_h: 'बिल्डिंग',
    now_building_p: 'सिक्योर ऑथ, async प्रोसेसिंग और measurable performance के साथ practical AI-assisted API systems बना रहा हूं।',
    testimonials_title: 'सहयोगियों की राय'
  }
};

function trackEvent(name, payload = {}) {
  const event = {
    name,
    payload,
    ts: new Date().toISOString()
  };
  const current = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
  current.push(event);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(current.slice(-80)));
  if (navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/analytics', JSON.stringify(event));
    } catch (e) {
      // ignore network failures for static hosting
    }
  }
}

function initLoader() {
  if (!loader) return;
  const chars = qsa('.loader-char', loader);
  const sub = qs('.loader-subtext', loader);
  const page = qsa('header, main, .footer');

  if (hasGSAP && !prefersReducedMotion) {
    window.gsap.set(page, { opacity: 0, y: 16 });
    const tl = window.gsap.timeline();
    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.08,
      ease: 'power2.out'
    })
      .to(sub, { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' }, '-=0.14')
      .to(chars, {
        y: -20,
        opacity: 0,
        duration: 0.28,
        stagger: 0.05,
        ease: 'power2.in'
      }, '+=0.42')
      .to(sub, { opacity: 0, y: -10, duration: 0.25, ease: 'power1.in' }, '<')
      .to(loader, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          loader.classList.add('hidden');
          document.body.classList.remove('loading');
        }
      })
      .to(page, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out'
      }, '-=0.2');
  } else {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      page.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, 850);
  }
}

function initSmoothScroll() {
  if (prefersReducedMotion || typeof window.Lenis === 'undefined') return;
  lenisInstance = new window.Lenis({
    duration: 1.2,
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.05
  });

  if (hasGSAP) {
    window.gsap.ticker.add((t) => {
      lenisInstance.raf(t * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
    if (hasScrollTrigger) {
      lenisInstance.on('scroll', window.ScrollTrigger.update);
    }
  } else {
    const raf = (t) => {
      lenisInstance.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}

function initCursor() {
  const desktopCursor = window.matchMedia('(min-width: 861px)').matches;
  if (!desktopCursor || !cursorDot || !cursorRing || !cursorBlob) return;

  window.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursorDot.style.left = `${state.mouseX}px`;
    cursorDot.style.top = `${state.mouseY}px`;
  });

  qsa('a, button, .project-card, .time-card, .repo-card, .skill-node, .btn').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('active');
      state.blobTargetScale = 1.45;
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('active');
      state.blobTargetScale = 1;
    });
  });

  const tick = () => {
    if (tabHidden) {
      requestAnimationFrame(tick);
      return;
    }
    state.ringX += (state.mouseX - state.ringX) * 0.17;
    state.ringY += (state.mouseY - state.ringY) * 0.17;
    state.blobX += (state.mouseX - state.blobX) * 0.1;
    state.blobY += (state.mouseY - state.blobY) * 0.1;
    state.blobScale += (state.blobTargetScale - state.blobScale) * 0.14;

    cursorRing.style.left = `${state.ringX}px`;
    cursorRing.style.top = `${state.ringY}px`;
    cursorBlob.style.left = `${state.blobX}px`;
    cursorBlob.style.top = `${state.blobY}px`;
    cursorBlob.style.transform = `translate(-50%, -50%) scale(${state.blobScale})`;

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initMagnetic() {
  qsa('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

function initTilt() {
  qsa('.tilt').forEach((card) => {
    if (card.dataset.tiltBound === '1') return;
    card.dataset.tiltBound = '1';

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 8.5;
      const ry = (x - 0.5) * 8.5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

function initAmbientMotion() {
  if (!hasGSAP || prefersReducedMotion) return;

  window.gsap.to('.hero-visual-glow', {
    yPercent: -10,
    xPercent: 8,
    duration: 6.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });

  window.gsap.utils.toArray('.hero-panel, .hero-quick-grid article, .stat-card').forEach((el, i) => {
    window.gsap.to(el, {
      y: i % 2 === 0 ? -5 : 5,
      duration: 3.4 + (i % 4) * 0.35,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  });

  qsa('.hero-visual, .hero-content').forEach((el) => {
    window.gsap.to(el, {
      y: -16,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.1
      }
    });
  });
}

function initRevealAnimations() {
  const revealEls = qsa('.reveal');
  if (!hasGSAP || prefersReducedMotion) {
    revealEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  revealEls.forEach((el) => {
    window.gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.78,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%'
      }
    });
  });

  window.gsap.from('.hero-title', { y: 52, opacity: 0, duration: 0.92, ease: 'power3.out', delay: 0.45 });
  window.gsap.from('.hero-copy', { y: 24, opacity: 0, duration: 0.82, ease: 'power2.out', delay: 0.62 });
  window.gsap.from('.hero-actions', { y: 22, opacity: 0, duration: 0.72, ease: 'power2.out', delay: 0.74 });
  window.gsap.from('.hero-quick-grid', { y: 22, opacity: 0, duration: 0.72, ease: 'power2.out', delay: 0.78 });
  window.gsap.from('.stat-grid', { y: 22, opacity: 0, duration: 0.72, ease: 'power2.out', delay: 0.86 });
}

function initSectionTransitions() {
  const links = qsa('nav a[href^="#"], .logo[href^="#"], .section-dock a[href^="#"]');
  if (!links.length) return;

  const closeMenu = () => {
    if (!menuBtn || !siteNav) return;
    siteNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();

      const jump = () => {
        if (lenisInstance && !prefersReducedMotion) {
          lenisInstance.scrollTo(target, { offset: -8, duration: 1.05 });
        } else {
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      };

      if (hasGSAP && sectionTransition && !prefersReducedMotion) {
        const tl = window.gsap.timeline();
        tl.to(sectionTransition, { opacity: 1, scaleY: 1, duration: 0.18, ease: 'power1.out' })
          .add(jump)
          .to(sectionTransition, { opacity: 0, scaleY: 0, transformOrigin: 'bottom', duration: 0.32, ease: 'power1.out' }, '+=0.07')
          .set(sectionTransition, { transformOrigin: 'top' });
      } else {
        jump();
      }
    });
  });
}

function initScrollProgress() {
  if (!progressBar) return;
  const update = () => {
    const doc = document.documentElement;
    const top = doc.scrollTop || document.body.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (top / max) * 100 : 0;
    progressBar.style.width = `${Math.min(100, pct)}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initActiveNav() {
  const navLinks = qsa('nav a[href^="#"]');
  const dock = qsa('.section-dock a[href^="#"]');
  const allLinks = [...navLinks, ...dock];
  const uniqueTargets = [...new Set(allLinks.map((a) => a.getAttribute('href')))];
  const sections = uniqueTargets.map((href) => qs(href)).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      dock.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
    });
  }, { threshold: 0.45 });

  sections.forEach((s) => io.observe(s));

  const initial = window.location.hash || '#home';
  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === initial));
  dock.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === initial));
}

function initTopButton() {
  if (!topButton) return;

  const update = () => {
    topButton.classList.toggle('show', window.scrollY > 520);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  topButton.addEventListener('click', () => {
    if (lenisInstance && !prefersReducedMotion) {
      lenisInstance.scrollTo(0, { duration: 1.05 });
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
}

function initMenuToggle() {
  if (!menuBtn || !siteNav) return;
  menuBtn.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      siteNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initThemeToggle() {
  if (!themeToggle) return;
  const saved = localStorage.getItem('portfolio_theme');
  if (saved === 'light') document.body.classList.add('theme-light');

  const updateLabel = () => {
    themeToggle.textContent = document.body.classList.contains('theme-light') ? 'Dark' : 'Light';
  };
  updateLabel();

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    localStorage.setItem('portfolio_theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
    updateLabel();
    trackEvent('theme_toggle', { theme: document.body.classList.contains('theme-light') ? 'light' : 'dark' });
  });
}

function initLanguageToggle() {
  if (!langToggle) return;
  let lang = localStorage.getItem('portfolio_lang') || 'en';

  const apply = () => {
    const dict = I18N[lang] || I18N.en;
    qsa('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
    langToggle.textContent = lang.toUpperCase();
    langToggle.setAttribute('aria-label', `Language ${lang.toUpperCase()}`);
  };

  apply();
  langToggle.addEventListener('click', () => {
    lang = lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('portfolio_lang', lang);
    apply();
    trackEvent('lang_toggle', { lang });
  });
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdk) cmdk.classList.add('open');
      if (cmdk) cmdk.setAttribute('aria-hidden', 'false');
      const input = qs('#cmdk-input');
      if (input) input.focus();
      return;
    }

    if (e.defaultPrevented) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;

    const key = e.key.toLowerCase();
    const map = {
      g: '#github',
      p: '#projects',
      c: '#contact',
      s: '#skills',
      h: '#home'
    };
    if (!map[key]) return;
    const target = qs(map[key]);
    if (!target) return;
    trackEvent('shortcut_nav', { key, target: map[key] });
    if (lenisInstance && !prefersReducedMotion) lenisInstance.scrollTo(target, { offset: -8, duration: 0.95 });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function initCommandPalette() {
  if (!cmdk) return;
  const input = qs('#cmdk-input');
  const list = qs('#cmdk-list');
  const actions = [
    { label: 'Go: Home', run: () => qs('#home') },
    { label: 'Go: Projects', run: () => qs('#projects') },
    { label: 'Go: GitHub', run: () => qs('#github') },
    { label: 'Go: Contact', run: () => qs('#contact') },
    { label: 'Toggle Theme', run: () => themeToggle },
    { label: 'Toggle Language', run: () => langToggle }
  ];

  const close = () => {
    cmdk.classList.remove('open');
    cmdk.setAttribute('aria-hidden', 'true');
  };

  const render = (query = '') => {
    if (!list) return;
    const q = query.trim().toLowerCase();
    const filtered = actions.filter((a) => a.label.toLowerCase().includes(q));
    list.innerHTML = filtered.map((a, i) => `<button class="cmdk-item${i === 0 ? ' active' : ''}" data-idx="${actions.indexOf(a)}">${a.label}</button>`).join('');
  };

  render('');

  if (input) {
    input.addEventListener('input', () => render(input.value));
  }

  cmdk.addEventListener('click', (e) => {
    const closeTarget = e.target.closest('[data-close="cmdk"]');
    if (closeTarget) {
      close();
      return;
    }
    const item = e.target.closest('.cmdk-item');
    if (!item) return;
    const idx = Number(item.dataset.idx);
    const action = actions[idx];
    if (!action) return;
    const target = action.run();
    close();
    if (target === themeToggle || target === langToggle) {
      target.click();
      trackEvent('cmdk_action', { action: action.label });
      return;
    }
    if (target && lenisInstance && !prefersReducedMotion) lenisInstance.scrollTo(target, { offset: -8, duration: 0.9 });
    else if (target) target.scrollIntoView({ behavior: 'smooth' });
    trackEvent('cmdk_action', { action: action.label });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cmdk.classList.contains('open')) {
      close();
    }
  });
}

function initEventTracking() {
  qsa('.track-event').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent(el.dataset.event || 'click', { href: el.getAttribute('href') || '' });
    });
  });
  qsa('.hero-actions a, .btn-solid, .btn-outline, .btn-ghost').forEach((el) => {
    el.addEventListener('click', () => trackEvent('cta_click', { text: (el.textContent || '').trim() }));
  });
}

function animateCounters() {
  const counters = qsa('[data-count]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const value = Number(el.dataset.count || 0);
      const hasPercent = (el.textContent || '').includes('%');
      const suffix = hasPercent ? '%' : '+';
      const start = performance.now();
      const dur = 1300;

      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - (1 - t) ** 3;
        const n = Math.round(value * eased);
        el.textContent = `${n}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.55 });

  counters.forEach((c) => io.observe(c));
}

function formatNumber(v) {
  return new Intl.NumberFormat('en-US').format(v);
}

function animateMetric(el, target) {
  if (!el) return;
  const currentRaw = String(el.textContent || '').replace(/[^0-9]/g, '');
  const current = Number(currentRaw || 0);
  const start = performance.now();
  const duration = 820;

  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    const value = Math.round(current + (target - current) * eased);
    el.textContent = formatNumber(value);
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function topLanguage(repos) {
  const freq = new Map();
  repos.forEach((r) => {
    if (!r.language) return;
    freq.set(r.language, (freq.get(r.language) || 0) + 1);
  });
  const entries = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  return entries.length ? entries[0][0] : 'N/A';
}

function repoCard(repo) {
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  return `<article class="repo-card tilt"><div class="repo-top"><span>${repo.language || 'Unknown'}</span><span>Updated ${updated}</span></div><h3>${repo.name}</h3><p>${repo.description || 'No description provided.'}</p><div class="repo-meta"><span>Stars ${repo.stargazers_count}</span><span>Forks ${repo.forks_count}</span><span>${repo.visibility}</span></div><p><a href="${repo.html_url}" target="_blank" rel="noreferrer">Open Repository</a></p></article>`;
}

const CASES = {
  sentinel: {
    title: 'SentinelStream Fraud Detection',
    summary: 'High-throughput fraud analysis pipeline handling >1000 transactions/min with real-time model scoring.',
    meta: ['FastAPI', 'Redis', 'Celery', 'ML', '2025'],
    arch: 'client -> api-gateway -> FastAPI\\nFastAPI -> Redis queue -> Celery workers\\nworkers -> model service -> PostgreSQL',
    snippet: "POST /v1/transactions/score\\n{ amount, user_id, merchant_id }\\n=> { risk_score, action }",
    approach: [
      'Designed async API ingestion with background job processing.',
      'Implemented streaming risk score evaluation and queue management.',
      'Added caching and retry logic to keep API response stable under load.'
    ],
    outcome: [
      '94% fraud-detection accuracy.',
      'Reliable throughput at 1000+ transactions/minute.',
      'Reduced false positives through iterative feature tuning.'
    ]
  },
  curamind: {
    title: 'CuraMind AI',
    summary: 'Healthcare-oriented prediction workflow with secure user access and ML-assisted diagnosis.',
    meta: ['Django', 'REST', 'ML', 'Auth', '2025-2026'],
    arch: 'web app -> Django API\\nDjango -> model inference service\\nDjango -> PostgreSQL + audit log',
    snippet: "POST /api/v1/diagnosis/predict\\n{ symptoms, vitals }\\n=> { prediction, confidence }",
    approach: [
      'Built modular Django backend with role-aware access control.',
      'Integrated model prediction endpoints with validation guardrails.',
      'Introduced monitoring endpoints for operational observability.'
    ],
    outcome: [
      'Faster diagnosis assistance flows.',
      'Secure API foundation with robust auth handling.',
      'Production-ready API patterns for further expansion.'
    ]
  },
  optimization: {
    title: 'Backend Service Optimization',
    summary: 'Internship-driven reliability and performance improvements for API + database heavy services.',
    meta: ['FastAPI', 'PostgreSQL', 'Profiling', 'Internship'],
    arch: 'client -> API\\nAPI -> query planner/index layer\\nAPI -> PostgreSQL (optimized indexes)',
    snippet: "EXPLAIN ANALYZE SELECT ...\\nCREATE INDEX CONCURRENTLY idx_txn_user_created_at ON transactions(user_id, created_at);",
    approach: [
      'Analyzed slow queries and introduced indexing strategy.',
      'Refactored hotspots and reduced repetitive DB operations.',
      'Added release checks and issue triage process.'
    ],
    outcome: [
      '30% lower query latency.',
      '25% fewer reported bugs.',
      '99% service uptime across sprint releases.'
    ]
  }
};

function initCaseStudies() {
  if (!caseModal) return;
  const titleEl = qs('#case-title');
  const summaryEl = qs('#case-summary');
  const metaEl = qs('#case-meta');
  const archEl = qs('#case-arch');
  const snippetEl = qs('#case-snippet');
  const approachEl = qs('#case-approach');
  const outcomeEl = qs('#case-outcome');
  const kickerEl = qs('#case-kicker');

  const openModal = (key) => {
    const data = CASES[key];
    if (!data) return;
    if (titleEl) titleEl.textContent = data.title;
    if (summaryEl) summaryEl.textContent = data.summary;
    if (kickerEl) kickerEl.textContent = 'Case Study';
    if (metaEl) metaEl.innerHTML = data.meta.map((m) => `<span>${m}</span>`).join('');
    if (archEl) archEl.textContent = data.arch || '';
    if (snippetEl) snippetEl.textContent = data.snippet || '';
    if (approachEl) approachEl.innerHTML = data.approach.map((i) => `<li>${i}</li>`).join('');
    if (outcomeEl) outcomeEl.innerHTML = data.outcome.map((i) => `<li>${i}</li>`).join('');
    caseModal.classList.add('open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trackEvent('case_open', { key });
  };

  const closeModal = () => {
    caseModal.classList.remove('open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  qsa('.case-btn').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.case));
  });
  qsa('[data-close="case-modal"]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal.classList.contains('open')) closeModal();
  });
}

async function initDeployStatus() {
  const status = qs('#deploy-status');
  const text = qs('#status-text');
  if (!status || !text) return;

  try {
    const res = await fetch('https://api.github.com/users/Kaif0333', { method: 'GET' });
    if (!res.ok) throw new Error('status fetch failed');
    status.classList.add('live');
    text.textContent = 'Live and reachable';
    trackEvent('deploy_status', { status: 'live' });
  } catch (e) {
    status.classList.remove('live');
    text.textContent = 'Network check unavailable';
    trackEvent('deploy_status', { status: 'unknown' });
  }
}

async function loadGithubData() {
  const user = 'Kaif0333';
  const followersEl = qs('#gh-followers');
  const reposEl = qs('#gh-public-repos');
  const starsEl = qs('#gh-total-stars');
  const langEl = qs('#gh-top-language');
  const grid = qs('#github-grid');

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=24`)
    ]);

    if (!profileRes.ok || !reposRes.ok) throw new Error('GitHub API request failed');

    const profile = await profileRes.json();
    const repos = await reposRes.json();
    const ownRepos = repos.filter((r) => !r.fork);
    const featured = ownRepos
      .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
      .slice(0, 6);

    const stars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);

    if (followersEl) animateMetric(followersEl, profile.followers || 0);
    if (reposEl) animateMetric(reposEl, profile.public_repos || 0);
    if (starsEl) animateMetric(starsEl, stars);
    if (langEl) langEl.textContent = topLanguage(ownRepos);

    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(repoCard).join('')
        : '<article class="repo-placeholder">No public repositories found.</article>';
    }

    initTilt();
    if (hasGSAP && !prefersReducedMotion) {
      window.gsap.fromTo('.repo-card', { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.08,
        ease: 'power2.out'
      });
    } else {
      qsa('.repo-card').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  } catch (err) {
    if (followersEl) followersEl.textContent = 'N/A';
    if (reposEl) reposEl.textContent = 'N/A';
    if (starsEl) starsEl.textContent = 'N/A';
    if (langEl) langEl.textContent = 'N/A';
    if (grid) grid.innerHTML = '<article class="repo-placeholder">GitHub data could not be loaded right now.</article>';
  }
}

function initSkillsUniverse() {
  const universe = qs('#skills-universe');
  const orbit = qs('#skills-orbit');
  const linksSvg = qs('#skills-links');
  const tooltip = qs('#skills-tooltip');
  const sideDots = qsa('#skills-side-dots i');
  if (!universe || !orbit || !linksSvg || !tooltip) return;

  const skills = [
    { name: 'Python', level: 'Advanced', icon: 'assets/skills/python.svg', color: '#76d3ff' },
    { name: 'FastAPI', level: 'Advanced', icon: 'assets/skills/fastapi.svg', color: '#6af2d8' },
    { name: 'Django', level: 'Advanced', icon: 'assets/skills/django.svg', color: '#82f5ce' },
    { name: 'JavaScript', level: 'Advanced', icon: 'assets/skills/javascript.svg', color: '#81d1ff' },
    { name: 'TypeScript', level: 'Intermediate', icon: 'assets/skills/typescript.svg', color: '#84bbff' },
    { name: 'React', level: 'Intermediate', icon: 'assets/skills/react.svg', color: '#80e6ff' },
    { name: 'Node.js', level: 'Intermediate', icon: 'assets/skills/nodejs.svg', color: '#8be1c5' },
    { name: 'PostgreSQL', level: 'Advanced', icon: 'assets/skills/postgresql.svg', color: '#9dbfff' },
    { name: 'MongoDB', level: 'Intermediate', icon: 'assets/skills/mongodb.svg', color: '#90eacc' },
    { name: 'MySQL', level: 'Intermediate', icon: 'assets/skills/mysql.svg', color: '#9fceff' },
    { name: 'Redis', level: 'Advanced', icon: 'assets/skills/redis.svg', color: '#8ad4ff' },
    { name: 'Docker', level: 'Intermediate', icon: 'assets/skills/docker.svg', color: '#89bfff' },
    { name: 'Git', level: 'Advanced', icon: 'assets/skills/git.svg', color: '#7fc6ff' },
    { name: 'Linux', level: 'Intermediate', icon: 'assets/skills/linux.svg', color: '#96d9ff' }
  ];

  orbit.innerHTML = '';
  linksSvg.innerHTML = '';

  const nodes = skills.map((skill) => {
    const el = document.createElement('div');
    el.className = 'skill-node';
    el.innerHTML = `<div class="skill-dot"><img src="${skill.icon}" alt="${skill.name} logo" loading="lazy" /></div>`;

    const img = qs('img', el);
    if (img) {
      img.addEventListener('error', () => {
        img.remove();
        const dot = qs('.skill-dot', el);
        if (dot) dot.textContent = skill.name.slice(0, 2).toUpperCase();
      });
    }

    orbit.appendChild(el);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', skill.color);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('opacity', '0.14');
    linksSvg.appendChild(line);

    return { ...skill, el, line };
  });

  const touch = window.matchMedia('(pointer: coarse)').matches;
  const radius = touch ? 132 : 205;
  const perspective = touch ? 560 : 720;

  const points = skills.map((_, i) => {
    const n = skills.length;
    const y = 1 - (i / (n - 1 || 1)) * 2;
    const base = Math.sqrt(1 - y * y);
    const theta = i * 2.399963229728653;
    return {
      x: Math.cos(theta) * base,
      y,
      z: Math.sin(theta) * base
    };
  });

  let rotY = 0;
  let rotX = -0.2;
  let velocityY = touch ? 0.00095 : 0.0013;
  let velocityX = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  const centerX = () => universe.clientWidth / 2;
  const centerY = () => universe.clientHeight / 2;

  const setDragging = (v) => {
    dragging = v;
    universe.style.cursor = v ? 'grabbing' : (touch ? 'grab' : 'none');
  };

  universe.style.cursor = touch ? 'grab' : 'none';

  universe.addEventListener('pointerdown', (e) => {
    setDragging(true);
    startX = e.clientX;
    startY = e.clientY;
    universe.setPointerCapture(e.pointerId);
  });

  universe.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    velocityY += dx * 0.000042;
    velocityX += dy * 0.000027;
  });

  const endDrag = () => setDragging(false);
  universe.addEventListener('pointerup', endDrag);
  universe.addEventListener('pointercancel', endDrag);
  universe.addEventListener('pointerleave', () => {
    if (dragging) setDragging(false);
  });

  universe.addEventListener('wheel', (e) => {
    e.preventDefault();
    velocityY += (e.deltaY < 0 ? 1 : -1) * 0.00028;
  }, { passive: false });

  if (!prefersReducedMotion) {
    nodes.forEach((node) => {
      node.el.addEventListener('mouseenter', () => {
        tooltip.textContent = `${node.name} • ${node.level}`;
        tooltip.classList.add('show');
        state.blobTargetScale = 1.52;
      });

      node.el.addEventListener('mousemove', (e) => {
        const rect = universe.getBoundingClientRect();
        tooltip.style.left = `${e.clientX - rect.left}px`;
        tooltip.style.top = `${e.clientY - rect.top}px`;
      });

      node.el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
        state.blobTargetScale = 1;
      });
    });
  }

  const tick = () => {
    if (tabHidden) {
      requestAnimationFrame(tick);
      return;
    }
    if (!dragging) velocityY += (0.0011 - velocityY) * 0.022;
    velocityY *= 0.996;
    velocityX *= 0.989;

    rotY += velocityY;
    rotX += velocityX;
    rotX = Math.max(-0.62, Math.min(0.62, rotX));

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const cx = centerX();
    const cy = centerY();

    nodes.forEach((node, i) => {
      const p = points[i];

      const x = p.x * radius;
      const y = p.y * radius;
      const z = p.z * radius;

      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const depth = (z2 + radius) / (radius * 2);
      const scale = 0.72 + depth * 0.5;
      const alpha = 0.22 + depth * 0.78;

      const k = perspective / (perspective + z2 + radius * 1.1);
      const sx = x1 * k;
      const sy = y1 * k * 0.93;

      node.el.style.transform = `translate(-50%, -50%) translate(${sx}px, ${sy}px) scale(${scale})`;
      node.el.style.opacity = `${alpha}`;
      node.el.style.zIndex = `${Math.round(depth * 1000)}`;
      node.el.classList.toggle('front', depth > 0.62);

      node.line.setAttribute('x1', `${cx}`);
      node.line.setAttribute('y1', `${cy}`);
      node.line.setAttribute('x2', `${cx + sx * 0.95}`);
      node.line.setAttribute('y2', `${cy + sy * 0.95}`);
      node.line.setAttribute('opacity', `${0.03 + depth * 0.2}`);
    });

    if (sideDots.length) {
      const normalized = ((rotY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor((normalized / (Math.PI * 2)) * sideDots.length) % sideDots.length;
      sideDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    const cx = centerX();
    const cy = centerY();
    nodes.forEach((node, i) => {
      const p = points[i];
      const x = p.x * radius * 0.88;
      const y = p.y * radius * 0.88;
      node.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      node.el.style.opacity = '0.9';
      node.line.setAttribute('x1', `${cx}`);
      node.line.setAttribute('y1', `${cy}`);
      node.line.setAttribute('x2', `${cx + x}`);
      node.line.setAttribute('y2', `${cy + y}`);
      node.line.setAttribute('opacity', '0.14');
    });
    return;
  }

  requestAnimationFrame(tick);
}

function initSkillsOnDemand() {
  const skillsSection = qs('#skills');
  if (!skillsSection) return;
  let started = false;
  const boot = () => {
    if (started) return;
    started = true;
    initSkillsUniverse();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          boot();
          io.disconnect();
        }
      });
    }, { rootMargin: '220px 0px', threshold: 0.01 });
    io.observe(skillsSection);
  } else {
    boot();
  }
}

function initGithubOnDemand() {
  const githubSection = qs('#github');
  if (!githubSection) return;
  let started = false;
  const boot = () => {
    if (started) return;
    started = true;
    loadGithubData();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          boot();
          io.disconnect();
        }
      });
    }, { rootMargin: '260px 0px', threshold: 0.01 });
    io.observe(githubSection);
  } else {
    boot();
  }
}

function initDeferredEnhancements() {
  const run = () => {
    initAmbientMotion();
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1200 });
  } else {
    setTimeout(run, 450);
  }
}

document.addEventListener('visibilitychange', () => {
  tabHidden = document.hidden;
});

initLoader();
initSmoothScroll();
initCursor();
initMagnetic();
initTilt();
initRevealAnimations();
initSectionTransitions();
initScrollProgress();
initActiveNav();
initTopButton();
initMenuToggle();
initThemeToggle();
initLanguageToggle();
initKeyboardShortcuts();
initCommandPalette();
initEventTracking();
initCaseStudies();
initDeployStatus();
initSkillsOnDemand();
animateCounters();
initGithubOnDemand();
initDeferredEnhancements();

