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
  ringY: window.innerHeight / 2
};

const loader = qs('#loader');
const sectionTransition = qs('.section-transition');
const cursorDot = qs('.cursor-dot');
const cursorRing = qs('.cursor-ring');
const magneticEls = qsa('.magnetic');
const revealEls = qsa('.reveal');
const counters = qsa('[data-count]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopCursor = window.matchMedia('(min-width: 861px)').matches;

function initLoader() {
  if (!loader) return;
  const chars = qsa('.loader-char', loader);

  if (hasGSAP && !prefersReducedMotion) {
    const tl = window.gsap.timeline();
    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.08,
      ease: 'power2.out'
    })
      .to(chars, {
        y: -10,
        opacity: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in'
      }, '+=0.45')
      .to(loader, {
        opacity: 0,
        duration: 0.45,
        onComplete: () => loader.classList.add('hidden')
      });
  } else {
    chars.forEach((char) => {
      char.style.opacity = '1';
      char.style.transform = 'none';
    });
    setTimeout(() => loader.classList.add('hidden'), 900);
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
  if (!desktopCursor || !cursorDot || !cursorRing) return;

  window.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursorDot.style.left = `${state.mouseX}px`;
    cursorDot.style.top = `${state.mouseY}px`;
  });

  qsa('a, .project-card, .time-card, .repo-card, .btn').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });

  function loop() {
    state.ringX += (state.mouseX - state.ringX) * 0.16;
    state.ringY += (state.mouseY - state.ringY) * 0.16;
    cursorRing.style.left = `${state.ringX}px`;
    cursorRing.style.top = `${state.ringY}px`;
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
animateCounters();
loadGithubData();
loadMusicVibe();
