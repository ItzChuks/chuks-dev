/* ===========================
   main.js — Portfolio Logic
   =========================== */

// ── THEME ──────────────────────────────────────────
const html = document.documentElement;
const themeIcon = document.getElementById('theme-icon');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
setTheme(savedTheme);

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
  drawCanvas(); // redraw with new theme
});


// ── MOBILE MENU ────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
const mobileBtn = document.getElementById('mobile-menu-btn');
let menuOpen = false;

mobileBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('hidden', !menuOpen);
  mobileMenu.classList.toggle('flex', menuOpen);
});

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.add('hidden');
  mobileMenu.classList.remove('flex');
}


// ── CANVAS PARTICLES ───────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.min(80, Math.floor(window.innerWidth / 16));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

function drawCanvas() {
  if (animFrame) cancelAnimationFrame(animFrame);
  resizeCanvas();
  createParticles();

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = html.getAttribute('data-theme') !== 'light';
    const dotColor = isDark ? '108, 99, 255' : '108, 99, 255';
    const lineColor = isDark ? '108, 99, 255' : '108, 99, 255';

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotColor}, ${p.opacity})`;
      ctx.fill();

      // Connect nearby
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / 130) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animFrame = requestAnimationFrame(loop);
  }
  loop();
}

drawCanvas();
window.addEventListener('resize', drawCanvas);


// ── TYPEWRITER ─────────────────────────────────────
const roles = [
  'Frontend Developer',
  'React.js Engineer',
  'UI Craftsman',
  'Mobile Dev (React Native)',
  'Full-Stack Builder',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-role');

function typeRole() {
  const role = roles[roleIdx];
  if (!deleting) {
    typedEl.textContent = role.slice(0, ++charIdx);
    if (charIdx === role.length) {
      setTimeout(() => { deleting = true; }, 2200);
      setTimeout(typeRole, 2300);
      return;
    }
  } else {
    typedEl.textContent = role.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeRole, deleting ? 50 : 90);
}

setTimeout(typeRole, 1200);


// ── TECH BADGES ────────────────────────────────────
const techBadges = [
  'Git', 'GitHub', 'Appwrite', 'Firebase', 'REST APIs',
  'GraphQL', 'Figma', 'TypeScript', 'SCSS', 'Webpack', 'Vite'
];

const badgeContainer = document.getElementById('tech-badges');
techBadges.forEach((tech, i) => {
  const el = document.createElement('span');
  el.className = 'tech-badge';
  el.textContent = tech;
  el.style.animationDelay = `${i * 0.05}s`;
  badgeContainer.appendChild(el);
});


// ── SCROLL REVEAL ──────────────────────────────────
const reveals = document.querySelectorAll('.reveal-section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate skill bars when skills section enters
      if (entry.target.closest('#skills')) {
        document.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      }
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));


// ── FILTER TABS ────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterProjects(btn.dataset.filter);
  });
});

function filterProjects(filter) {
  const cards = document.querySelectorAll('.project-card');
  let shown = 0;
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    const match = filter === 'all' || tags.toLowerCase().includes(filter.toLowerCase());
    card.style.display = match ? 'flex' : 'none';
    if (match) shown++;
  });
  document.getElementById('no-projects').classList.toggle('hidden', shown > 0);
}


// ── FOOTER YEAR ────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();


// ── ACTIVE NAV ON SCROLL ───────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });
