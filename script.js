const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
if (hasGSAP && hasScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  ringX: window.innerWidth / 2,
  ringY: window.innerHeight / 2,
  distortX: window.innerWidth / 2,
  distortY: window.innerHeight / 2,
  distortScale: 1,
  distortTargetScale: 1
};

const loader = qs('#loader');
const sectionTransition = qs('.section-transition');
const cursorDot = qs('.cursor-dot');
const cursorRing = qs('.cursor-ring');
const cursorDistort = qs('.cursor-distort');
const heroSpotlight = qs('.hero-spotlight');
const scrollProgressBar = qs('#scroll-progress-bar');
const topButton = qs('#to-top');
const magneticEls = qsa('.magnetic');
const revealEls = qsa('.reveal');
const counters = qsa('[data-count]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopCursor = window.matchMedia('(min-width: 861px)').matches;

function initLoader() {
  if (!loader) return;
  const chars = qsa('.loader-char', loader);
  const sub = qs('.loader-subtext', loader);
  const pageSections = qsa('header, main, .footer');

  if (hasGSAP && !prefersReducedMotion) {
    window.gsap.set(pageSections, { opacity: 0, y: 16 });
    const tl = window.gsap.timeline();
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.35,
      stagger: 0.08,
      ease: 'power2.out'
    })
      .to(sub, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
      .to(chars, {
        y: -16,
        opacity: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in'
      }, '+=0.45')
      .to(sub, { opacity: 0, y: -8, duration: 0.3, ease: 'power1.in' }, '<')
      .to(loader, { scale: 1.02, duration: 0.24, ease: 'power1.out' }, '<')
      .to(loader, {
        opacity: 0,
        duration: 0.52,
        onComplete: () => {
          loader.classList.add('hidden');
          document.body.classList.remove('loading');
        }
      })
      .to(pageSections, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out'
      }, '-=0.18');
  } else {
    chars.forEach((char) => {
      char.style.opacity = '1';
      char.style.transform = 'none';
    });
    if (sub) sub.style.opacity = '1';
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      pageSections.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, 900);
  }
}

function initSmoothScroll() {
  if (prefersReducedMotion || typeof window.Lenis === 'undefined') return;
  const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function initCursor() {
  if (!desktopCursor || !cursorDot || !cursorRing || !cursorDistort) return;

  window.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursorDot.style.left = `${state.mouseX}px`;
    cursorDot.style.top = `${state.mouseY}px`;
  });

  qsa('a, .project-card, .time-card, .repo-card, .btn').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('active');
      state.distortTargetScale = 1.45;
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('active');
      state.distortTargetScale = 1;
    });
  });

  function loop() {
    state.ringX += (state.mouseX - state.ringX) * 0.16;
    state.ringY += (state.mouseY - state.ringY) * 0.16;
    state.distortX += (state.mouseX - state.distortX) * 0.1;
    state.distortY += (state.mouseY - state.distortY) * 0.1;
    state.distortScale += (state.distortTargetScale - state.distortScale) * 0.13;
    cursorRing.style.left = `${state.ringX}px`;
    cursorRing.style.top = `${state.ringY}px`;
    cursorDistort.style.left = `${state.distortX}px`;
    cursorDistort.style.top = `${state.distortY}px`;
    cursorDistort.style.transform = `translate(-50%, -50%) scale(${state.distortScale})`;
    if (heroSpotlight) {
      heroSpotlight.style.left = `${state.distortX}px`;
      heroSpotlight.style.top = `${state.distortY}px`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function initMagnetic() {
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.13}px, ${y * 0.13}px)`;
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
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

function initRevealAnimations() {
  if (!hasGSAP || prefersReducedMotion) {
    revealEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  revealEls.forEach((el, i) => {
    window.gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.78,
      delay: (i % 8) * 0.04,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' }
    });
  });

  window.gsap.from('.hero-title', { y: 46, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.5 });
  window.gsap.from('.hero-copy', { y: 25, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.72 });
  window.gsap.from('.stat-grid', { y: 24, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.86 });
}

function initSectionTransitions() {
  const anchorLinks = qsa('nav a[href^="#"], .logo[href^="#"]');
  if (!anchorLinks.length) return;

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = qs(href);
      if (!target) return;

      e.preventDefault();

      const goToTarget = () => {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      };

      if (hasGSAP && sectionTransition && !prefersReducedMotion) {
        const tl = window.gsap.timeline();
        tl.to(sectionTransition, { opacity: 1, duration: 0.2, ease: 'power1.out' })
          .add(goToTarget)
          .to(sectionTransition, { opacity: 0, duration: 0.35, ease: 'power1.out' }, '+=0.06');
      } else {
        goToTarget();
      }
    });
  });
}

function initScrollProgress() {
  if (!scrollProgressBar) return;
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgressBar.style.width = `${Math.min(progress, 100)}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

function initActiveNav() {
  const navLinks = qsa('nav a[href^="#"]');
  const sections = navLinks
    .map((link) => qs(link.getAttribute('href')))
    .filter(Boolean);

  if (!navLinks.length || !sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    });
  }, { threshold: 0.55 });

  sections.forEach((section) => io.observe(section));
}

function initTopButton() {
  if (!topButton) return;

  const toggleButton = () => {
    if (window.scrollY > 500) topButton.classList.add('show');
    else topButton.classList.remove('show');
  };

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();

  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

function initBackgroundParallax() {
  if (!heroSpotlight || prefersReducedMotion) return;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    heroSpotlight.style.marginLeft = `${x}px`;
    heroSpotlight.style.marginTop = `${y}px`;
  });
}

function initSkillsUniverse() {
  const universe = qs('#skills-universe');
  const orbit = qs('#skills-orbit');
  const linksSvg = qs('#skills-links');
  const tooltip = qs('#skills-tooltip');
  const sideDots = qsa('#skills-side-dots i');
  if (!universe || !orbit || !linksSvg || !tooltip) return;

  const skills = [
    { name: 'Git', level: 'Advanced', short: 'Gt', color: '#F05032', icon: 'assets/skills/git.svg' },
    { name: 'Java', level: 'Advanced', short: 'Ja', color: '#EA2D2E', icon: 'assets/skills/java.svg' },
    { name: 'MySQL', level: 'Intermediate', short: 'My', color: '#4479A1', icon: 'assets/skills/mysql.svg' },
    { name: 'Redis', level: 'Advanced', short: 'Rd', color: '#DC382D', icon: 'assets/skills/redis.svg' },
    { name: 'Python', level: 'Advanced', short: 'Py', color: '#3776AB', icon: 'assets/skills/python.svg' },
    { name: 'FastAPI', level: 'Advanced', short: 'Fa', color: '#009688', icon: 'assets/skills/fastapi.svg' },
    { name: 'Django', level: 'Advanced', short: 'Dj', color: '#0C4B33', icon: 'assets/skills/django.svg' },
    { name: 'JavaScript', level: 'Advanced', short: 'JS', color: '#F7DF1E', icon: 'assets/skills/javascript.svg' },
    { name: 'React', level: 'Intermediate', short: 'Re', color: '#61DAFB', icon: 'assets/skills/react.svg' },
    { name: 'Node.js', level: 'Intermediate', short: 'Nd', color: '#539E43', icon: 'assets/skills/nodejs.svg' },
    { name: 'PostgreSQL', level: 'Advanced', short: 'Pg', color: '#336791', icon: 'assets/skills/postgresql.svg' },
    { name: 'MongoDB', level: 'Intermediate', short: 'Mg', color: '#13AA52', icon: 'assets/skills/mongodb.svg' },
    { name: 'Docker', level: 'Intermediate', short: 'Dc', color: '#2496ED', icon: 'assets/skills/docker.svg' },
    { name: 'TypeScript', level: 'Intermediate', short: 'TS', color: '#3178C6', icon: 'assets/skills/typescript.svg' },
    { name: 'HTML5', level: 'Advanced', short: 'H5', color: '#E34F26', icon: 'assets/skills/html5.svg' },
    { name: 'Linux', level: 'Intermediate', short: 'Lx', color: '#FCC624', icon: 'assets/skills/linux.svg' }
  ];

  orbit.innerHTML = '';
  linksSvg.innerHTML = '';
  const nodes = skills.map((skill) => {
    const node = document.createElement('div');
    node.className = 'skill-node';
    node.innerHTML = `<div class="skill-dot"><img src="${skill.icon}" alt="${skill.name} logo" loading="lazy" /><span>${skill.short}</span></div><span class="skill-name">${skill.name}</span>`;
    node.style.setProperty('--skill-color', skill.color);
    const img = qs('img', node);
    if (img) {
      img.addEventListener('error', () => {
        const dot = qs('.skill-dot', node);
        if (dot) dot.classList.add('no-icon');
        img.remove();
      });
    }
    orbit.appendChild(node);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', skill.color);
    line.setAttribute('stroke-width', '1');
    linksSvg.appendChild(line);
    return { ...skill, el: node, line };
  });

  const touch = window.matchMedia('(pointer: coarse)').matches;
  const globeRadius = touch ? 138 : 198;
  const perspective = touch ? 500 : 660;
  const golden = Math.PI * (3 - Math.sqrt(5));
  let rotY = 0;
  let rotX = -0.22;
  let velocityY = touch ? 0.001 : 0.00145;
  let velocityX = 0;
  const baseVelocityY = touch ? 0.001 : 0.00145;
  let dragging = false;
  let dragX = 0;
  let dragY = 0;

  const points = skills.map((_, i) => {
    const n = skills.length;
    const t = n <= 1 ? 0 : i / (n - 1);
    const y = 1 - t * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });

  const centerX = () => universe.clientWidth / 2;
  const centerY = () => universe.clientHeight / 2;

  const setDragState = (v) => {
    dragging = v;
    universe.style.cursor = v ? 'grabbing' : (desktopCursor ? 'none' : 'grab');
  };

  universe.style.cursor = desktopCursor ? 'none' : 'grab';

  universe.addEventListener('pointerdown', (e) => {
    setDragState(true);
    dragX = e.clientX;
    dragY = e.clientY;
    universe.setPointerCapture(e.pointerId);
  });

  universe.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    const dy = e.clientY - dragY;
    dragX = e.clientX;
    dragY = e.clientY;
    velocityY += dx * (touch ? 0.000035 : 0.000055);
    velocityX += dy * (touch ? 0.000024 : 0.00004);
  });

  universe.addEventListener('wheel', (e) => {
    e.preventDefault();
    velocityY += (e.deltaY < 0 ? 1 : -1) * 0.00035;
  }, { passive: false });

  const stopDrag = () => setDragState(false);
  universe.addEventListener('pointerup', stopDrag);
  universe.addEventListener('pointercancel', stopDrag);
  universe.addEventListener('pointerleave', () => {
    if (dragging) setDragState(false);
  });

  function tick() {
    if (!dragging) velocityY += (baseVelocityY - velocityY) * 0.03;
    velocityY *= (touch ? 0.996 : 0.994);
    velocityX *= 0.987;
    const step = (Math.PI * 2) / skills.length;
    if (!dragging && Math.abs(velocityY) < 0.00045) {
      const target = Math.round(rotY / step) * step;
      rotY += (target - rotY) * 0.02;
    }
    rotY += velocityY;
    rotX += velocityX;
    rotX = Math.max(-0.65, Math.min(0.65, rotX));

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    nodes.forEach((node, i) => {
      const p = points[i];
      const px = p.x * globeRadius;
      const py = p.y * globeRadius;
      const pz = p.z * globeRadius;

      const x1 = px * cosY - pz * sinY;
      const z1 = px * sinY + pz * cosY;
      const y1 = py * cosX - z1 * sinX;
      const z2 = py * sinX + z1 * cosX;
      const d = perspective / (perspective + z2 + globeRadius * 0.95);
      const sx = x1 * d;
      const sy = y1 * d * 0.93;
      const depth = Math.max(0, Math.min(1, (z2 / (globeRadius * 2)) + 0.5));
      const scale = 0.72 + d * 0.42;
      const alpha = 0.25 + depth * 0.75;

      node.el.style.transform = `translate(-50%, -50%) translate(${sx}px, ${sy}px) scale(${scale})`;
      node.el.style.opacity = `${alpha}`;
      node.el.style.zIndex = `${Math.round(d * 1000)}`;
      node.el.classList.toggle('front', depth > 0.63);

      const x2 = centerX() + sx * 0.95;
      const y2 = centerY() + sy * 0.95;
      node.line.setAttribute('x1', `${centerX()}`);
      node.line.setAttribute('y1', `${centerY()}`);
      node.line.setAttribute('x2', `${x2}`);
      node.line.setAttribute('y2', `${y2}`);
      node.line.setAttribute('opacity', `${0.04 + depth * 0.2}`);
    });

    if (sideDots.length) {
      const norm = ((rotY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor((norm / (Math.PI * 2)) * sideDots.length) % sideDots.length;
      sideDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }

    requestAnimationFrame(tick);
  }

  if (prefersReducedMotion) {
    nodes.forEach((node, i) => {
      const p = points[i];
      const x = p.x * globeRadius * 0.9;
      const y = p.y * globeRadius * 0.9;
      node.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      const x2 = centerX() + x;
      const y2 = centerY() + y;
      node.line.setAttribute('x1', `${centerX()}`);
      node.line.setAttribute('y1', `${centerY()}`);
      node.line.setAttribute('x2', `${x2}`);
      node.line.setAttribute('y2', `${y2}`);
      node.line.setAttribute('opacity', '0.12');
    });
    return;
  }

  nodes.forEach((node) => {
    node.el.addEventListener('mouseenter', () => {
      tooltip.textContent = `${node.name} • ${node.level}`;
      tooltip.classList.add('show');
      state.distortTargetScale = 1.52;
      velocityY *= 0.94;
    });
    node.el.addEventListener('mousemove', (e) => {
      const rect = universe.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - rect.left}px`;
      tooltip.style.top = `${e.clientY - rect.top}px`;
    });
    node.el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
      state.distortTargetScale = 1;
    });
    node.el.addEventListener('click', () => {
      tooltip.textContent = `${node.name} • ${node.level}`;
      tooltip.classList.add('show');
      setTimeout(() => tooltip.classList.remove('show'), 900);
    });
  });

  requestAnimationFrame(tick);
}

function animateCounters() {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const n = Number(el.dataset.count || 0);
      const suffix = el.textContent.includes('%') ? '%' : '+';
      const start = performance.now();
      const dur = 1300;

      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const v = Math.round(n * (1 - (1 - t) ** 3));
        el.textContent = `${v}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.55 });

  counters.forEach((c) => io.observe(c));
}

function numberFormat(v) {
  return new Intl.NumberFormat('en-US').format(v);
}

function topLanguageFromRepos(repos) {
  const map = new Map();
  repos.forEach((r) => {
    if (!r.language) return;
    map.set(r.language, (map.get(r.language) || 0) + 1);
  });
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : 'N/A';
}

function repoCard(repo) {
  const desc = repo.description || 'No description provided.';
  const lang = repo.language || 'Unknown';
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return `<article class="repo-card tilt reveal"><div class="repo-top"><span>${lang}</span><span>Updated ${updated}</span></div><h3>${repo.name}</h3><p>${desc}</p><div class="repo-meta"><span>Stars ${repo.stargazers_count}</span><span>Forks ${repo.forks_count}</span><span>${repo.visibility}</span></div><p><a href="${repo.html_url}" target="_blank" rel="noreferrer">Open Repository</a></p></article>`;
}

async function loadGithubData() {
  const user = 'Kaif0333';
  const followersEl = qs('#gh-followers');
  const reposEl = qs('#gh-public-repos');
  const starsEl = qs('#gh-total-stars');
  const langEl = qs('#gh-top-language');
  const grid = qs('#github-grid');

  try {
    const [pRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=12`)
    ]);

    if (!pRes.ok || !rRes.ok) throw new Error('GitHub API request failed');

    const profile = await pRes.json();
    const repos = await rRes.json();

    const nonFork = repos.filter((r) => !r.fork);
    const topRepos = nonFork.sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count)).slice(0, 6);
    const totalStars = nonFork.reduce((sum, r) => sum + r.stargazers_count, 0);

    if (followersEl) followersEl.textContent = numberFormat(profile.followers);
    if (reposEl) reposEl.textContent = numberFormat(profile.public_repos);
    if (starsEl) starsEl.textContent = numberFormat(totalStars);
    if (langEl) langEl.textContent = topLanguageFromRepos(nonFork);

    if (grid) {
      grid.innerHTML = topRepos.length ? topRepos.map(repoCard).join('') : '<article class="repo-placeholder">No public repositories found.</article>';
    }

    initTilt();
    if (!hasGSAP || prefersReducedMotion) {
      qsa('.repo-card').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  } catch (e) {
    if (grid) grid.innerHTML = '<article class="repo-placeholder">GitHub data could not be loaded right now.</article>';
    if (followersEl) followersEl.textContent = 'N/A';
    if (reposEl) reposEl.textContent = 'N/A';
    if (starsEl) starsEl.textContent = 'N/A';
    if (langEl) langEl.textContent = 'N/A';
  }
}

async function loadMusicVibe() {
  const artEl = qs('#music-art');
  const titleEl = qs('#music-title');
  const artistEl = qs('#music-artist');
  const linkEl = qs('#music-link');
  if (!artEl || !titleEl || !artistEl || !linkEl) return;

  const fallback = {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    art: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7e/8e/13/7e8e13b2-e2b8-f8b6-266d-ef0463346884/20UM1IM17563.rgb.jpg/512x512bb.jpg',
    link: 'https://music.apple.com/'
  };

  try {
    const res = await fetch('https://itunes.apple.com/search?term=top%20global%20hits&media=music&limit=1');
    if (!res.ok) throw new Error('Music API request failed');
    const data = await res.json();
    if (!data.results || !data.results.length) throw new Error('No music results');

    const track = data.results[0];
    artEl.src = (track.artworkUrl100 || '').replace('100x100bb', '512x512bb');
    artEl.alt = `${track.trackName} artwork`;
    titleEl.textContent = track.trackName || fallback.title;
    artistEl.textContent = track.artistName || fallback.artist;
    linkEl.href = track.trackViewUrl || fallback.link;
  } catch (e) {
    artEl.src = fallback.art;
    artEl.alt = `${fallback.title} artwork`;
    titleEl.textContent = fallback.title;
    artistEl.textContent = fallback.artist;
    linkEl.href = fallback.link;
  }
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
initBackgroundParallax();
initSkillsUniverse();
animateCounters();
loadGithubData();
loadMusicVibe();
