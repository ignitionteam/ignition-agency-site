/* ════════════════════════════════════════════════════════════════
   Ignition Agency — shared front-end behaviour
   Three.js starfield · custom cursor · nav · scroll reveals · count-up
   All guarded so pages still work if a CDN fails to load.
   ════════════════════════════════════════════════════════════════ */

// ─── THREE.JS SPACE SCENE ───────────────────────────────────────────────────
(function () {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 1;

  function makeStarField(count, spread, size, color) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * spread;
      pos[i*3+1] = (Math.random() - 0.5) * spread * 0.6;
      pos[i*3+2] = (Math.random() - 0.5) * spread - 200;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.8 });
    return new THREE.Points(geo, mat);
  }

  const stars1 = makeStarField(3000, 2000, 0.6, 0xffffff);
  const stars2 = makeStarField(1000, 2000, 1.2, 0x8ab4ff);
  const stars3 = makeStarField(500,  2000, 2.0, 0xff8866);
  scene.add(stars1, stars2, stars3);

  const nebulaGeo = new THREE.BufferGeometry();
  const nebulaPos = new Float32Array(800 * 3);
  for (let i = 0; i < 800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 80 + Math.random() * 120;
    nebulaPos[i*3]   = Math.cos(theta) * r;
    nebulaPos[i*3+1] = (Math.random() - 0.5) * 60;
    nebulaPos[i*3+2] = Math.sin(theta) * r - 300;
  }
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
  const nebulaMat = new THREE.PointsMaterial({ color: 0x4f7cff, size: 3, sizeAttenuation: true, transparent: true, opacity: 0.08 });
  scene.add(new THREE.Points(nebulaGeo, nebulaMat));

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.15;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    stars1.rotation.y += 0.0001;
    stars2.rotation.y -= 0.00008;
    stars3.rotation.z += 0.00005;
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.position.z = 1 + scrollY * 0.002;
    nebulaMat.opacity = 0.06 + Math.sin(frame * 0.01) * 0.02;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})();

// ─── CUSTOM CURSOR ──────────────────────────────────────────────────────────
(function () {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let cx = 0, cy = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
  (function animCursor() {
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  })();
  document.querySelectorAll('a, button, .card, .product-card, .post-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('expand'); ring.classList.add('expand'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('expand'); ring.classList.remove('expand'); });
  });
})();

// ─── NAV SCROLL STATE ───────────────────────────────────────────────────────
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

// ─── NAV MENU HELPERS (global, used by inline onclick) ───────────────────────
function toggleMenu() {
  const nav = document.getElementById('nav-links');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.toggle('open');
  if (btn) btn.classList.toggle('active');
}
function closeMenu() {
  const nav = document.getElementById('nav-links');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.remove('open');
  if (btn) btn.classList.remove('active');
}

// ─── SCROLL REVEALS + COUNT-UP (GSAP if present, else fallback) ──────────────
(function () {
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const counts  = Array.from(document.querySelectorAll('[data-count]'));

  if (typeof gsap !== 'undefined') {
    document.body.classList.add('js-loaded');
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    reveals.forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });

    counts.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: el, start: 'top 80%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power1.out',
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); }
          });
        }
      });
    });
  } else {
    // No GSAP — reveal everything via IntersectionObserver, snap counts to value
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
    counts.forEach(el => { el.textContent = el.dataset.count; });
  }
})();
