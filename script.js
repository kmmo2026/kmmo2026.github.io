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

  // ── Coin construction using a Group for perfect texture control ──
  const coin = new THREE.Group();

  // 1. Gold edge: open-ended cylinder rotated to face camera (+Z axis)
  const edgeGeo = new THREE.CylinderGeometry(1, 1, 0.16, 128, 1, true);
  edgeGeo.rotateX(Math.PI / 2);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xFFC000,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide
  });
  const edgeMesh = new THREE.Mesh(edgeGeo, goldMat);
  coin.add(edgeMesh);

  // 2. Texture for the faces (no weird flips or rotations needed)
  const texLoader = new THREE.TextureLoader();
  const faceTex = texLoader.load('logo.png');

  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    metalness: 0.2,
    roughness: 0.5,
    color: 0xeeeeee,
  });

  // 3. Front Face: perfectly flat circle facing camera (+Z)
  const frontGeo = new THREE.CircleGeometry(1, 128);
  const frontMesh = new THREE.Mesh(frontGeo, faceMat);
  frontMesh.position.z = 0.08; // Half the thickness (0.16 / 2)
  coin.add(frontMesh);

  // 4. Back Face: perfectly flat circle facing away (-Z)
  const backGeo = new THREE.CircleGeometry(1, 128);
  backGeo.rotateY(Math.PI); // Rotate it to face backwards
  const backMesh = new THREE.Mesh(backGeo, faceMat);
  backMesh.position.z = -0.08;
  coin.add(backMesh);

  scene.add(coin);

  // ── Lighting ──
  const dirLight = new THREE.DirectionalLight(0xfffbe6, 1.5);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const tealLight = new THREE.PointLight(0x00d4aa, 1.5, 20);
  tealLight.position.set(-3, 1, 3);
  scene.add(tealLight);

  const fillLight = new THREE.PointLight(0xffe5a0, 1.0, 15);
  fillLight.position.set(3, -2, 2);
  scene.add(fillLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // ── Animate: spin only on Y axis ──
  function animate() {
    requestAnimationFrame(animate);
    coin.rotation.y += 0.02;        // steady spin on its own axis
    renderer.render(scene, camera);
  }
  animate();
})();
