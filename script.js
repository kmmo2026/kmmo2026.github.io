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
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,212,170,${0.08*(1-dist/100)})`;
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

// ── Navbar ──
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

// ── Card reveal ──
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

// ── THREE.js 3D Coin ──
(function() {
  const coinCanvas = document.getElementById('coinCanvas');
  if (!coinCanvas || typeof THREE === 'undefined') return;

  const SIZE = 320;
  const renderer = new THREE.WebGLRenderer({ canvas: coinCanvas, alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 4);
  camera.lookAt(0, 0, 0);

  // ── Coin geometry: CylinderGeometry(radiusTop, radiusBottom, height, segments)
  // Group 0 = edge/side, Group 1 = top face, Group 2 = bottom face
  const geo = new THREE.CylinderGeometry(1, 1, 0.14, 128, 1, false);

  // Gold metallic material for the edge
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    metalness: 0.95,
    roughness: 0.15,
  });

  // Face material — load the coin image as texture
  const texLoader = new THREE.TextureLoader();
  const faceTex = texLoader.load('logo.png');
  // Rotate texture 90° so it faces correctly (PNG is top-down, Three expects it flat)
  faceTex.center.set(0.5, 0.5);
  faceTex.rotation = Math.PI / 2;

  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    metalness: 0.6,
    roughness: 0.25,
    color: 0xffffff,
  });

  // CylinderGeometry: material array [edge, top, bottom]
  const coin = new THREE.Mesh(geo, [goldMat, faceMat, faceMat]);
  // Tilt slightly so user sees both face AND edge while spinning
  coin.rotation.x = Math.PI * 0.08;
  scene.add(coin);

  // ── Lighting ──
  // Warm top light
  const dirLight = new THREE.DirectionalLight(0xfff5cc, 2.5);
  dirLight.position.set(3, 5, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Teal accent point light (KMMO brand color)
  const tealLight = new THREE.PointLight(0x00d4aa, 3, 15);
  tealLight.position.set(-3, 2, 3);
  scene.add(tealLight);

  // Soft fill light from below
  const fillLight = new THREE.PointLight(0xffe080, 1.2, 10);
  fillLight.position.set(2, -3, 2);
  scene.add(fillLight);

  // Ambient so nothing is pitch black
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // ── Animate ──
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    coin.rotation.y += 0.018;
    // Subtle breathing on tilt
    coin.rotation.x = Math.PI * 0.08 + Math.sin(time * 0.5) * 0.04;
    renderer.render(scene, camera);
  }
  animate();
})();
