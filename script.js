// ── Particles ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.1,
    color: Math.random() > 0.5 ? '0,212,170' : '255,215,0'
  };
}

for (let i = 0; i < 120; i++) particles.push(createParticle());

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,212,170,${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Card reveal on scroll ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .token-card, .step-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ── Real 3D Coin Builder ──
// Builds a true cylinder: front face + ring of gold segments for thickness + back face
function buildCoin(coinEl, radius, thickness) {
  const SEGS = 80;                         // smoothness of the edge ring
  const segW = (2 * Math.PI * radius) / SEGS + 0.5; // slight overlap to avoid gaps

  for (let i = 0; i < SEGS; i++) {
    const angle = (360 / SEGS) * i;
    const seg = document.createElement('div');
    seg.className = 'coin-edge-seg';
    seg.style.width  = segW + 'px';
    seg.style.marginLeft = -(segW / 2) + 'px';
    seg.style.height = thickness + 'px';
    seg.style.marginTop = -(thickness / 2) + 'px';
    // rotate around Y-axis, push out to edge of circle
    seg.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    coinEl.appendChild(seg);
  }
}

// Main large coin (radius = 150 for 300px scene)
const coinMain = document.getElementById('coinMain');
if (coinMain) buildCoin(coinMain, 148, 40);

// Small coin in download section (radius = 80 for 160px scene)
const coinSmall = document.getElementById('coinSmall');
if (coinSmall) buildCoin(coinSmall, 78, 30);
