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
  const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  const raf = (t) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
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
      const rx = (0.5 - y) * 10;
      const ry = (x - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
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
  window.gsap.from('.stat-grid', { y: 22, opacity: 0, duration: 0.72, ease: 'power2.out', delay: 0.86 });
}

function initSectionTransitions() {
  const links = qsa('nav a[href^="#"], .logo[href^="#"]');
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

      const jump = () => target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      if (hasGSAP && sectionTransition && !prefersReducedMotion) {
        const tl = window.gsap.timeline();
        tl.to(sectionTransition, { opacity: 1, duration: 0.18, ease: 'power1.out' })
          .add(jump)
          .to(sectionTransition, { opacity: 0, duration: 0.32, ease: 'power1.out' }, '+=0.07');
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
  const sections = navLinks.map((a) => qs(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
    });
  }, { threshold: 0.55 });

  sections.forEach((s) => io.observe(s));
}

function initTopButton() {
  if (!topButton) return;

  const update = () => {
    topButton.classList.toggle('show', window.scrollY > 520);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
  return `<article class="repo-card tilt reveal"><div class="repo-top"><span>${repo.language || 'Unknown'}</span><span>Updated ${updated}</span></div><h3>${repo.name}</h3><p>${repo.description || 'No description provided.'}</p><div class="repo-meta"><span>Stars ${repo.stargazers_count}</span><span>Forks ${repo.forks_count}</span><span>${repo.visibility}</span></div><p><a href="${repo.html_url}" target="_blank" rel="noreferrer">Open Repository</a></p></article>`;
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

    if (followersEl) followersEl.textContent = formatNumber(profile.followers || 0);
    if (reposEl) reposEl.textContent = formatNumber(profile.public_repos || 0);
    if (starsEl) starsEl.textContent = formatNumber(stars);
    if (langEl) langEl.textContent = topLanguage(ownRepos);

    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(repoCard).join('')
        : '<article class="repo-placeholder">No public repositories found.</article>';
    }

    initTilt();
    if (!hasGSAP || prefersReducedMotion) {
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
    { name: 'Python', level: 'Advanced', icon: 'assets/skills/python.svg', color: '#ffd080' },
    { name: 'FastAPI', level: 'Advanced', icon: 'assets/skills/fastapi.svg', color: '#88ffc2' },
    { name: 'Django', level: 'Advanced', icon: 'assets/skills/django.svg', color: '#9affc9' },
    { name: 'JavaScript', level: 'Advanced', icon: 'assets/skills/javascript.svg', color: '#ffe28d' },
    { name: 'TypeScript', level: 'Intermediate', icon: 'assets/skills/typescript.svg', color: '#9bc2ff' },
    { name: 'React', level: 'Intermediate', icon: 'assets/skills/react.svg', color: '#9df1ff' },
    { name: 'Node.js', level: 'Intermediate', icon: 'assets/skills/nodejs.svg', color: '#bcff98' },
    { name: 'PostgreSQL', level: 'Advanced', icon: 'assets/skills/postgresql.svg', color: '#a4c1ff' },
    { name: 'MongoDB', level: 'Intermediate', icon: 'assets/skills/mongodb.svg', color: '#a8ffbe' },
    { name: 'MySQL', level: 'Intermediate', icon: 'assets/skills/mysql.svg', color: '#a9d6ff' },
    { name: 'Redis', level: 'Advanced', icon: 'assets/skills/redis.svg', color: '#ffb39d' },
    { name: 'Docker', level: 'Intermediate', icon: 'assets/skills/docker.svg', color: '#9dc7ff' },
    { name: 'Git', level: 'Advanced', icon: 'assets/skills/git.svg', color: '#ffc09c' },
    { name: 'Linux', level: 'Intermediate', icon: 'assets/skills/linux.svg', color: '#fff0a0' }
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
  let velocityY = touch ? 0.0011 : 0.0015;
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
    velocityY += dx * 0.000052;
    velocityX += dy * 0.000034;
  });

  const endDrag = () => setDragging(false);
  universe.addEventListener('pointerup', endDrag);
  universe.addEventListener('pointercancel', endDrag);
  universe.addEventListener('pointerleave', () => {
    if (dragging) setDragging(false);
  });

  universe.addEventListener('wheel', (e) => {
    e.preventDefault();
    velocityY += (e.deltaY < 0 ? 1 : -1) * 0.00036;
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
    if (!dragging) velocityY += (0.00125 - velocityY) * 0.028;
    velocityY *= 0.994;
    velocityX *= 0.987;

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
initSkillsUniverse();
animateCounters();
loadGithubData();
