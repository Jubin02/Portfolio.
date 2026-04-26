/* ══════════════════════════════════════════════════════════════
   script3.js  —  Jubin Joseph Portfolio (index3 version)

   TABLE OF CONTENTS
   ──────────────────
   1.  Page Loading Overlay
   2.  Theme Toggle (Dark / Light Mode)
   3.  Canvas Particle Network
   4.  Mouse Spotlight
   5.  Custom Cursor
   6.  Navigation (scroll + mobile menu)
   7.  Scroll Progress Bar
   8.  Typing Animation
   9.  Scroll Reveal
   10. Magnetic Effect
   11. 3D Card Tilt
   12. Stat Counter Animation
   13. Smooth Anchor Scroll
   14. Bento Hero Glow
   15. Live Dublin Time
   16. Contact Form (Formspree)
   17. Tab Visibility (pause canvas when hidden)
   ══════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────────
   1. PAGE LOADING OVERLAY
   The .page-loader div covers the screen on first paint.
   It fades out once the page fires window.load.
   A minimum display time ensures the bar animation is always seen.
   ────────────────────────────────────────────────────────────── */
const pageLoader   = document.getElementById('pageLoader');
const loadStart    = performance.now();
const MIN_DISPLAY  = 1300; // ms — loader is always visible for at least this long

window.addEventListener('load', () => {
  const elapsed   = performance.now() - loadStart;
  const remaining = Math.max(0, MIN_DISPLAY - elapsed);
  setTimeout(() => pageLoader.classList.add('hidden'), remaining);
});


/* ──────────────────────────────────────────────────────────────
   2. THEME TOGGLE (Dark / Light Mode)
   Priority order: localStorage → OS preference → default dark.
   On click, toggles data-theme on <html> and saves to localStorage.
   CSS [data-theme="light"] handles all visual changes.
   ────────────────────────────────────────────────────────────── */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

const savedTheme   = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
html.dataset.theme = savedTheme || (prefersLight ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'light' ? 'dark' : 'light';
  html.dataset.theme = next;
  localStorage.setItem('theme', next);
});

function isLight() { return html.dataset.theme === 'light'; }


/* ──────────────────────────────────────────────────────────────
   3. CANVAS PARTICLE NETWORK
   Drifting dots and connecting lines drawn on a fixed <canvas>.
   Particle/line opacity is reduced slightly in light mode.

   TUNING:
     PARTICLE_COUNT  reduce if you notice performance issues
     CONNECT_DIST    max distance (px) to draw a line between dots
     SPEED           drift speed per frame
   ────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

let W, H, particles;
const PARTICLE_COUNT = 70;
const CONNECT_DIST   = 130;
const SPEED          = 0.35;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x   = Math.random() * W;
    this.y   = init ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
    this.vx  = (Math.random() - 0.5) * SPEED;
    this.vy  = (Math.random() - 0.5) * SPEED;
    this.r   = Math.random() * 1.5 + 0.5;
    this.hue = Math.random() > 0.5 ? '124,58,237' : '6,182,212';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hue},${isLight() ? 0.45 : 0.6})`;
    ctx.fill();
  }
}

function initParticles() { particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle()); }

function drawConnections() {
  const scale = isLight() ? 0.1 : 0.18;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECT_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${(1 - d / CONNECT_DIST) * scale})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    }
  }
}

let animRAF;
function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  animRAF = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
resize(); initParticles(); animate();


/* ──────────────────────────────────────────────────────────────
   4. MOUSE SPOTLIGHT
   Tracks cursor as CSS vars --mx / --my for the body::before gradient.
   ────────────────────────────────────────────────────────────── */
document.addEventListener('mousemove', e => {
  document.body.style.setProperty('--mx', e.clientX + 'px');
  document.body.style.setProperty('--my', e.clientY + 'px');
});


/* ──────────────────────────────────────────────────────────────
   5. CUSTOM CURSOR
   .c-dot  → snaps exactly to mouse position
   .c-ring → follows with a lerp lag (factor 0.1 per RAF frame)
   .hov class added on interactive elements to change cursor size.
   ────────────────────────────────────────────────────────────── */
const cDot  = document.getElementById('cDot');
const cRing = document.getElementById('cRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cDot.style.left = mx + 'px'; cDot.style.top = my + 'px';
});

(function followRing() {
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  cRing.style.left = rx + 'px'; cRing.style.top = ry + 'px';
  requestAnimationFrame(followRing);
})();

document.querySelectorAll(
  'a, button, .stat-block, .exp-card, .bento-card, .edu-item, .cert-item, .tilt-card'
).forEach(el => {
  el.addEventListener('mouseenter', () => { cDot.classList.add('hov');    cRing.classList.add('hov'); });
  el.addEventListener('mouseleave', () => { cDot.classList.remove('hov'); cRing.classList.remove('hov'); });
});


/* ──────────────────────────────────────────────────────────────
   6. NAVIGATION
   .stuck class → opaque background when scrollY > 50 px.
   Hamburger button toggles mobile dropdown.
   Clicking a mobile link closes the dropdown.
   ────────────────────────────────────────────────────────────── */
const nav    = document.getElementById('nav');
const mobBtn = document.getElementById('mobBtn');
const mobNav = document.getElementById('mobNav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 50);
}, { passive: true });

mobBtn.addEventListener('click', () => {
  const open = mobNav.classList.toggle('open');
  mobBtn.classList.toggle('open', open);
});

mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobNav.classList.remove('open'); mobBtn.classList.remove('open');
}));


/* ──────────────────────────────────────────────────────────────
   7. SCROLL PROGRESS BAR
   ────────────────────────────────────────────────────────────── */
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });


/* ──────────────────────────────────────────────────────────────
   8. TYPING ANIMATION
   Cycles through ROLES, typing and deleting each string.
   TO CHANGE ROLES: edit the array below.
   ────────────────────────────────────────────────────────────── */
const ROLES = [
  'Automation Engineer',
  'PLC Programmer',
  'Control Systems Developer',
  'BMS Specialist',
  'MEngSc Student @ UCD',
];

const typedEl  = document.getElementById('typedText');
let   rIdx = 0, cIdx = 0, deleting = false;

function typeLoop() {
  const current = ROLES[rIdx];
  cIdx = deleting ? cIdx - 1 : cIdx + 1;
  typedEl.textContent = current.slice(0, cIdx);
  let delay = deleting ? 42 : 72;
  if (!deleting && cIdx === current.length) { delay = 2400; deleting = true; }
  else if (deleting && cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % ROLES.length; delay = 380; }
  setTimeout(typeLoop, delay);
}
setTimeout(typeLoop, 1100);


/* ──────────────────────────────────────────────────────────────
   9. SCROLL REVEAL
   IntersectionObserver adds .vis to .reveal elements as they enter
   the viewport. Hero elements are triggered immediately with a stagger.
   ────────────────────────────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revObs  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
reveals.forEach(el => revObs.observe(el));

document.querySelectorAll('.hero .reveal').forEach((el, i) => {
  setTimeout(() => el.classList.add('vis'), 100 + i * 80);
});


/* ──────────────────────────────────────────────────────────────
   10. MAGNETIC EFFECT
   .magnetic elements subtly follow the cursor on hover.
   Pull strength: 0.22 multiplier. Adjust to increase / decrease pull.
   ────────────────────────────────────────────────────────────── */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.22;
    const y = (e.clientY - r.top  - r.height / 2) * 0.22;
    el.style.transition = 'transform 0.12s ease';
    el.style.transform  = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    el.style.transform  = 'translate(0, 0)';
  });
});


/* ──────────────────────────────────────────────────────────────
   11. 3D CARD TILT
   Perspective tilt based on cursor position within the card.
   Applied to all .tilt-card elements.
   ────────────────────────────────────────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transition = 'transform 0.1s ease';
    card.style.transform  = `perspective(800px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  });
});


/* ──────────────────────────────────────────────────────────────
   12. STAT COUNTER ANIMATION
   Counts from 0 to data-target when the card enters the viewport.
   data-suffix is appended to the number (e.g. "+").
   ────────────────────────────────────────────────────────────── */
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target.querySelector('.stat-num');
    if (!el) return;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step  = target / 38;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = Math.round(cur) + suffix;
    }, 28);
    statObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stat-block').forEach(b => statObs.observe(b));


/* ──────────────────────────────────────────────────────────────
   13. SMOOTH ANCHOR SCROLL
   Overrides browser's default jump-to-anchor with smooth scroll.
   ────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const sel = a.getAttribute('href');
    if (sel === '#') return;
    const target = document.querySelector(sel);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});


/* ──────────────────────────────────────────────────────────────
   14. BENTO HERO GLOW
   The .bento-glow div follows the mouse within the hero card.
   ────────────────────────────────────────────────────────────── */
const bentoHero = document.querySelector('.bento-hero');
if (bentoHero) {
  bentoHero.addEventListener('mousemove', e => {
    const r = bentoHero.getBoundingClientRect();
    const g = bentoHero.querySelector('.bento-glow');
    if (g) { g.style.left = (e.clientX - r.left - 160) + 'px'; g.style.top = (e.clientY - r.top - 160) + 'px'; }
  });
}


/* ──────────────────────────────────────────────────────────────
   15. LIVE DUBLIN TIME
   Updates the #dublinTime span every second using the
   Europe/Dublin timezone (handles Irish Summer Time automatically).
   ────────────────────────────────────────────────────────────── */
function updateDublinTime() {
  const el = document.getElementById('dublinTime');
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString('en-IE', {
    timeZone: 'Europe/Dublin',
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   false,
  });
}
updateDublinTime();
setInterval(updateDublinTime, 1000);


/* ──────────────────────────────────────────────────────────────
   16. CONTACT FORM (Formspree)
   Submits via fetch — no page reload.

   SETUP:
   1. Sign up at formspree.io (free — 50 submissions/month).
   2. Create a new form and copy your form ID.
   3. Replace 'YOUR_FORMSPREE_ID' below with it (e.g. 'xpwzabcd').

   States handled:
     loading   → button disabled, text changes to "Sending…"
     success   → green status message, form resets
     error     → red status message, button re-enabled
   ────────────────────────────────────────────────────────────── */
const FORMSPREE_ID  = 'mjgjdgrg';   // ← replace this

const contactForm   = document.getElementById('contactForm');
const formSubmit    = document.getElementById('formSubmit');
const formStatus    = document.getElementById('formStatus');

if (contactForm && FORMSPREE_ID !== 'YOUR_FORMSPREE_ID') {
  const originalBtnHTML = formSubmit.innerHTML;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Loading state
    formSubmit.disabled   = true;
    formSubmit.textContent = 'Sending…';
    formStatus.textContent = '';
    formStatus.className   = 'form-status';

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        formStatus.textContent = "Message sent — I'll be in touch soon.";
        formStatus.className   = 'form-status success';
        contactForm.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      formStatus.textContent = 'Something went wrong. Please email me directly.';
      formStatus.className   = 'form-status error';
    }

    formSubmit.disabled  = false;
    formSubmit.innerHTML = originalBtnHTML;
  });
} else if (contactForm) {
  /* Formspree ID not yet set — show a helpful note in the console */
  console.info('[Portfolio] Contact form: replace FORMSPREE_ID in script3.js to enable submissions.');
}


/* ──────────────────────────────────────────────────────────────
   17. TAB VISIBILITY
   Pauses the canvas animation loop when the tab is hidden
   to save CPU / battery when the user isn't watching.
   ────────────────────────────────────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(animRAF);
  else animate();
});
