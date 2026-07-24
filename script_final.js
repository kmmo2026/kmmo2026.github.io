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

  const scene = new THREE.Scene();

  // Camera looking straight at the coin
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 4.5);
  camera.lookAt(0, 0, 0);

  // ── Coin construction: completely vertical (STANDING UP) ──
  const coin = new THREE.Group();

  // 1. Gold edge: Cylinder rotated to face the camera (Z-aligned)
  const edgeGeo = new THREE.CylinderGeometry(1, 1, 0.22, 128, 1, true);
  edgeGeo.rotateX(Math.PI / 2); // Make it stand up!
  
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0xaa7700,
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide
  });
  const edgeMesh = new THREE.Mesh(edgeGeo, goldMat);
  coin.add(edgeMesh);

  // 2. Textures
  const texLoader = new THREE.TextureLoader();
  const faceTex = texLoader.load('logo.png');

  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    metalness: 0.3,
    roughness: 0.2,
    color: 0xdddddd, // slightly darker base color to reduce glare
    emissive: 0x111111,
    emissiveIntensity: 0.02, // very subtle
  });

  // 3. Front Face: Circle pointing directly at camera (+Z)
  const frontGeo = new THREE.CircleGeometry(1, 128);
  // No rotation needed! CircleGeometry is perfectly upright by default facing +Z
  const frontMesh = new THREE.Mesh(frontGeo, faceMat);
  frontMesh.position.z = 0.11; // Half of 0.22 thickness
  coin.add(frontMesh);

  // 4. Back Face: Circle pointing away from camera (-Z)
  const backGeo = new THREE.CircleGeometry(1, 128);
  backGeo.rotateY(Math.PI); // Rotate to face backwards, keeping UP as UP
  const backMesh = new THREE.Mesh(backGeo, faceMat);
  backMesh.position.z = -0.11;
  coin.add(backMesh);

  // NO TILT! Completely vertical.
  coin.rotation.x = 0; 
  scene.add(coin);

  // ── Lighting ──
  const dirLight = new THREE.DirectionalLight(0xfffbe6, 2.5); // reduced from 4.0
  dirLight.position.set(4, 6, 6);
  scene.add(dirLight);

  const tealLight = new THREE.PointLight(0x00d4aa, 2.0, 20); // reduced from 3.5
  tealLight.position.set(-4, 2, 4);
  scene.add(tealLight);

  const fillLight = new THREE.PointLight(0xffe5a0, 1.5, 15); // reduced from 2.5
  fillLight.position.set(3, -3, 3);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 1.0); // reduced from 1.5
  backLight.position.set(-3, 0, -3);
  scene.add(backLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4); // reduced from 0.8
  scene.add(ambient);

  // ── Animate ──
  function animate() {
    requestAnimationFrame(animate);
    coin.rotation.y += 0.02; // Spin like a wheel
    renderer.render(scene, camera);
  }
  animate();
})();
