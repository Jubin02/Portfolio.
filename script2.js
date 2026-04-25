/* ══════════════════════════════════════
   CANVAS PARTICLE NETWORK
══════════════════════════════════════ */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

let W, H, particles;
const PARTICLE_COUNT = 70;
const CONNECT_DIST   = 130;
const SPEED          = 0.35;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(true); }

  reset(init = false) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
    this.vx = (Math.random() - 0.5) * SPEED;
    this.vy = (Math.random() - 0.5) * SPEED;
    this.r  = Math.random() * 1.5 + 0.5;
    // alternate between purple and cyan
    this.hue = Math.random() > 0.5 ? '124,58,237' : '6,182,212';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > W + 10 ||
        this.y < -10 || this.y > H + 10) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hue},0.6)`;
    ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        const alpha = (1 - dist / CONNECT_DIST) * 0.18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
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
resize();
initParticles();
animate();

/* ══════════════════════════════════════
   SPOTLIGHT (mouse-follow)
══════════════════════════════════════ */
document.addEventListener('mousemove', (e) => {
  document.body.style.setProperty('--mx', e.clientX + 'px');
  document.body.style.setProperty('--my', e.clientY + 'px');
});

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
const cDot  = document.getElementById('cDot');
const cRing = document.getElementById('cRing');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cDot.style.left = mx + 'px';
  cDot.style.top  = my + 'px';
});

(function followRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  cRing.style.left = rx + 'px';
  cRing.style.top  = ry + 'px';
  requestAnimationFrame(followRing);
})();

document.querySelectorAll(
  'a, button, .stat-block, .exp-card, .bento-card, .edu-item, .cert-item, .tilt-card'
).forEach(el => {
  el.addEventListener('mouseenter', () => { cDot.classList.add('hov'); cRing.classList.add('hov'); });
  el.addEventListener('mouseleave', () => { cDot.classList.remove('hov'); cRing.classList.remove('hov'); });
});

/* ══════════════════════════════════════
   NAVIGATION SCROLL + MOBILE MENU
══════════════════════════════════════ */
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

mobNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobNav.classList.remove('open');
    mobBtn.classList.remove('open');
  });
});

/* ══════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════ */
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (window.scrollY / total) * 100;
  progressBar.style.width = progress + '%';
}, { passive: true });

/* ══════════════════════════════════════
   TYPING ANIMATION
══════════════════════════════════════ */
const ROLES = [
  'Automation Engineer',
  'PLC Programmer',
  'Control Systems Developer',
  'BMS Specialist',
  'MEngSc Student @ UCD',
];

const typedEl  = document.getElementById('typedText');
let   rIdx     = 0;
let   cIdx     = 0;
let   deleting = false;

function typeLoop() {
  const current = ROLES[rIdx];
  cIdx  = deleting ? cIdx - 1 : cIdx + 1;
  typedEl.textContent = current.slice(0, cIdx);

  let delay = deleting ? 42 : 72;
  if (!deleting && cIdx === current.length) { delay = 2400; deleting = true; }
  else if (deleting && cIdx === 0)          { deleting = false; rIdx = (rIdx + 1) % ROLES.length; delay = 380; }

  setTimeout(typeLoop, delay);
}
setTimeout(typeLoop, 1100);

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
const reveals = document.querySelectorAll('.reveal');

const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

reveals.forEach(el => revObs.observe(el));

// Immediate fire for hero
document.querySelectorAll('.hero .reveal').forEach((el, i) => {
  setTimeout(() => el.classList.add('vis'), 100 + i * 80);
});

/* ══════════════════════════════════════
   MAGNETIC EFFECT
══════════════════════════════════════ */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
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

/* ══════════════════════════════════════
   3D CARD TILT
══════════════════════════════════════ */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transition = 'transform 0.1s ease';
    card.style.transform  = `perspective(800px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* ══════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════ */
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target.querySelector('.stat-num');
    if (!el) return;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    let   cur    = 0;
    const step   = target / 38;
    const timer  = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = Math.round(cur) + suffix;
    }, 28);
    statObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stat-block').forEach(b => statObs.observe(b));

/* ══════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const sel = a.getAttribute('href');
    if (sel === '#') return;
    const target = document.querySelector(sel);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ══════════════════════════════════════
   BENTO HERO GLOW — follows mouse inside card
══════════════════════════════════════ */
const bentoHero = document.querySelector('.bento-hero');
if (bentoHero) {
  bentoHero.addEventListener('mousemove', (e) => {
    const r  = bentoHero.getBoundingClientRect();
    const x  = e.clientX - r.left;
    const y  = e.clientY - r.top;
    const g  = bentoHero.querySelector('.bento-glow');
    if (g) {
      g.style.left = (x - 160) + 'px';
      g.style.top  = (y - 160) + 'px';
    }
  });
}

/* Pause canvas when tab hidden (performance) */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animRAF);
  } else {
    animate();
  }
});
