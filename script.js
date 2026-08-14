/* ============================================================
   KUNAL PANIGRAHI — SCROLL-DRIVEN 3D JOURNEY
   Camera flies along a spline through a procedural world; real
   content surfaces in HTML chapter panels timed to the flight.
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

/* Chapter id -> [start, end] of total scroll progress (0..1).
   Order matches the waypoint array used for the camera path. */
const CHAPTERS = [
    { id: 'hero',           range: [0.000, 0.055] },
    { id: 'about',          range: [0.055, 0.145] },
    { id: 'experience',     range: [0.145, 0.260] },
    { id: 'certifications', range: [0.260, 0.355] },
    { id: 'dance',          range: [0.355, 0.410] },
    { id: 'singer',         range: [0.410, 0.460] },
    { id: 'cars',           range: [0.460, 0.510] },
    { id: 'photo',          range: [0.510, 0.560] },
    { id: 'art3d',          range: [0.560, 0.610] },
    { id: 'gaming',         range: [0.610, 0.665] },
    { id: 'soundtrack',     range: [0.665, 0.760] },
    { id: 'gallery',        range: [0.760, 0.860] },
    { id: 'resume',         range: [0.860, 1.000] }
];

const DOT_MAP = {
    hero: 'hero', about: 'about', experience: 'experience', certifications: 'certifications',
    dance: 'dance', singer: 'dance', cars: 'dance', photo: 'dance', art3d: 'dance', gaming: 'dance',
    soundtrack: 'soundtrack', gallery: 'gallery', resume: 'resume'
};

/* ---------- WebGL capability check ---------- */
function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/* ---------- Boot / loading sequence ---------- */
const boot = document.getElementById('boot');
const bootStatus = document.getElementById('boot-status');
const bootBar = document.getElementById('boot-bar-fill');

function setBootProgress(pct, label) {
    if (bootBar) bootBar.style.width = pct + '%';
    if (label && bootStatus) bootStatus.textContent = label;
}

function finishBoot() {
    if (boot) {
        boot.classList.add('boot-hide');
        setTimeout(() => { boot.style.display = 'none'; }, 950);
    }
    startTypingEffect();
}

/* ---------- Typing effect for hero role ---------- */
const words = [
    'Identity & Access Management Professional',
    'Solo Dancer',
    'Singer',
    'Automotive Enthusiast',
    'Photographer',
    '3D Artist',
    'Game Developer & Gamer'
];
let wordIndex = 0;
let typeTimer;

function getArticle(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }

function typingEffect() {
    const typedTextEl = document.getElementById('typed-text');
    const articleEl = document.getElementById('typed-article');
    if (!typedTextEl) return;
    if (articleEl) articleEl.textContent = getArticle(words[wordIndex]);
    let word = words[wordIndex].split('');
    function loopTyping() {
        if (word.length > 0) {
            typedTextEl.innerHTML += word.shift();
        } else {
            typeTimer = setTimeout(deletingEffect, 2000);
            return;
        }
        typeTimer = setTimeout(loopTyping, 90);
    }
    loopTyping();
}

function deletingEffect() {
    const typedTextEl = document.getElementById('typed-text');
    if (!typedTextEl) return;
    let word = typedTextEl.innerHTML.split('');
    function loopDeleting() {
        if (word.length > 0) {
            word.pop();
            typedTextEl.innerHTML = word.join('');
        } else {
            wordIndex = words.length > wordIndex + 1 ? wordIndex + 1 : 0;
            typingEffect();
            return;
        }
        typeTimer = setTimeout(loopDeleting, 45);
    }
    loopDeleting();
}

function startTypingEffect() {
    const el = document.getElementById('typed-text');
    if (!el || el.dataset.started) return;
    el.dataset.started = 'true';
    typingEffect();
}

/* ---------- Lightbox (shared between both render paths) ---------- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    const lbImg = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.lb-close');
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            lbImg.src = img.src;
            lbImg.alt = img.alt;
            lightbox.classList.add('open');
        });
    });
    function closeLightbox() { lightbox.classList.remove('open'); }
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ---------- Fallback path: no WebGL — plain stacked content ---------- */
function runFallback() {
    document.body.classList.add('no-webgl');
    if (boot) boot.style.display = 'none';
    startTypingEffect();
    initLightbox();

    document.querySelectorAll('.dot-item').forEach(dot => {
        dot.addEventListener('click', () => {
            const el = document.getElementById('chapter-' + dot.dataset.target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Simple reveal-on-scroll for fallback mode
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('chapter-active-fallback'); }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.chapter').forEach(ch => {
        ch.classList.add('active');
        revealObserver.observe(ch);
    });
}

/* ---------- Main WebGL journey ---------- */
async function runJourney() {
    setBootProgress(20, 'Loading world');
    const THREE = await import('three');
    setBootProgress(55, 'Assembling scene');

    const canvasContainer = document.getElementById('canvas-container');

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isFinePointer ? 2 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    canvasContainer.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    scene.fog = new THREE.FogExp2(0x05060a, 0.026);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 900);
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0x445566, 0.55));
    scene.add(new THREE.HemisphereLight(0x3fd7ff, 0x0a0a0f, 0.35));

    const fillA = new THREE.PointLight(0xe5342a, 6, 40);
    fillA.position.set(0, 1, -3);
    camera.add(fillA);
    const fillB = new THREE.PointLight(0x3fd7ff, 5, 40);
    fillB.position.set(0, -1, -6);
    camera.add(fillB);

    /* ---- Glow texture (cheap fake-bloom for emissive accents) ---- */
    function makeGlowTexture() {
        const size = 128;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }
    const glowTex = makeGlowTexture();
    function addGlow(parent, color, scale) {
        const mat = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const spr = new THREE.Sprite(mat);
        spr.scale.set(scale, scale, 1);
        parent.add(spr);
        return spr;
    }

    function matA() { return new THREE.MeshStandardMaterial({ color: 0x14161b, emissive: 0xe5342a, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.3, flatShading: true }); }
    function matB() { return new THREE.MeshStandardMaterial({ color: 0x14161b, emissive: 0x3fd7ff, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.3, flatShading: true }); }

    /* ---- Camera path: one waypoint per chapter ---- */
    const waypoints = CHAPTERS.map((_, i) => new THREE.Vector3(
        Math.sin(i * 0.65) * 9,
        Math.cos(i * 0.5) * 3 + i * 0.35,
        -i * 32
    ));
    const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.4);

    // Faint visible flight path
    const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 300, 0.025, 6, false),
        new THREE.MeshBasicMaterial({ color: 0x3fd7ff, transparent: true, opacity: 0.2 })
    );
    scene.add(tube);

    /* ---- Starfield (recentered on camera each frame — infinite skybox trick) ---- */
    function makeStarfield(count) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 140 + Math.random() * 260;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0x9fd8ff, size: 1.1, sizeAttenuation: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
        return new THREE.Points(geo, mat);
    }
    const starCount = isFinePointer ? 2600 : 1200;
    const starfield = makeStarfield(starCount);
    scene.add(starfield);

    /* ---- Station builders ---- */
    function makeCore(pos) {
        const g = new THREE.Group(); g.position.copy(pos);
        const geo = new THREE.IcosahedronGeometry(2.6, 1);
        const mesh = new THREE.Mesh(geo, matA());
        g.add(mesh);
        const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0x3fd7ff, transparent: true, opacity: 0.5 }));
        wire.scale.setScalar(1.06); g.add(wire);
        addGlow(g, 0xe5342a, 9);
        g.userData.animate = (t) => { mesh.rotation.y = t * 0.15; mesh.rotation.x = t * 0.08; wire.rotation.y = -t * 0.1; };
        return g;
    }

    function makeConstellation(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(6, 1.5, 0));
        const shapes = [
            new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), matA()),
            new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), matB()),
            new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.18, 8, 16), matA())
        ];
        shapes[0].position.set(-1.4, 0.6, 0);
        shapes[1].position.set(1.2, -0.4, 0.6);
        shapes[2].position.set(0, 1.2, -0.6);
        shapes.forEach(s => g.add(s));
        const pts = [shapes[0].position, shapes[1].position, shapes[2].position, shapes[0].position];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x3fd7ff, transparent: true, opacity: 0.35 })));
        g.userData.animate = (t) => { g.rotation.y = t * 0.12; shapes.forEach((s, i) => { s.rotation.x = t * 0.3 + i; s.rotation.y = t * 0.2 + i; }); };
        return g;
    }

    function makeGateRings() {
        const g = new THREE.Group();
        const ts = [0.175, 0.205, 0.235];
        const ringRefs = [];
        ts.forEach((tt, i) => {
            const p = curve.getPointAt(tt);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.12, 10, 32), i % 2 === 0 ? matA() : matB());
            ring.position.copy(p);
            const p2 = curve.getPointAt(Math.min(tt + 0.01, 1));
            ring.lookAt(p2);
            g.add(ring); ringRefs.push(ring);
        });
        g.userData.animate = (t) => { ringRefs.forEach(r => { r.rotation.z = t * 0.2; }); };
        return g;
    }

    function makeMedallions(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(7, 0, 0));
        const count = 7, radius = 3.4;
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), i % 2 === 0 ? matA() : matB());
            m.position.set(Math.cos(a) * radius, Math.sin(a) * radius * 0.6, Math.sin(a) * radius);
            g.add(m);
        }
        g.userData.animate = (t) => { g.rotation.y = t * 0.1; g.children.forEach((c, i) => { c.rotation.x = t * 0.4 + i; c.rotation.y = t * 0.3 + i; }); };
        return g;
    }

    function makeDance(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(-7, -2, 0));
        const floor = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0x14161b, emissive: 0xe5342a, emissiveIntensity: 0.25, roughness: 0.5 }));
        g.add(floor);
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const r = new THREE.Mesh(new THREE.TorusGeometry(1.2 + i * 0.9, 0.04, 8, 32), matB());
            r.rotation.x = Math.PI / 2; r.position.y = 0.15; g.add(r); rings.push(r);
        }
        const figure = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.1, 4, 8), matA());
        body.position.y = 1.1; figure.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), matA());
        head.position.y = 1.95; figure.add(head);
        g.add(figure);
        g.userData.animate = (t) => {
            rings.forEach((r, i) => { r.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.08); });
            figure.rotation.y = Math.sin(t * 0.6) * 0.6;
            figure.position.y = Math.abs(Math.sin(t * 2)) * 0.15;
        };
        return g;
    }

    function makeSinger(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(7, -1, 0));
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), matB()));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), matA());
        head.position.y = 1.15; g.add(head);
        const waves = [];
        for (let i = 0; i < 4; i++) {
            const w = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 24), matA());
            w.position.y = 1.15; w.rotation.x = Math.PI / 2;
            w.material.transparent = true;
            g.add(w); waves.push(w);
        }
        g.userData.animate = (t) => {
            waves.forEach((w, i) => {
                const local = ((t * 0.6 + i / 4) % 1);
                w.scale.setScalar(0.6 + local * 3);
                w.material.opacity = 1 - local;
            });
        };
        return g;
    }

    function makeCar(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(-7, -2.4, 0));
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1), matA());
        body.position.y = 0.4; g.add(body);
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.9), matA());
        cabin.position.set(-0.1, 0.8, 0); g.add(cabin);
        const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 12);
        [[0.8, 0.1, 0.55], [0.8, 0.1, -0.55], [-0.8, 0.1, 0.55], [-0.8, 0.1, -0.55]].forEach(([x, y, z]) => {
            const w = new THREE.Mesh(wheelGeo, matB()); w.rotation.z = Math.PI / 2; w.position.set(x, y, z); g.add(w);
        });
        const road = new THREE.Mesh(new THREE.BoxGeometry(14, 0.05, 2.2), new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.8 }));
        road.position.y = -0.1; g.add(road);
        [1.15, -1.15].forEach(z => { const e = new THREE.Mesh(new THREE.BoxGeometry(14, 0.03, 0.05), matB()); e.position.set(0, -0.07, z); g.add(e); });
        g.userData.animate = (t) => { body.position.y = 0.4 + Math.sin(t * 3) * 0.01; };
        return g;
    }

    function makePhotoRig(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(7, 0, 0));
        const count = 7, blades = [];
        for (let i = 0; i < count; i++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.05), matA());
            g.add(b); blades.push(b);
        }
        g.userData.animate = (t) => {
            const open = 0.6 + Math.sin(t * 0.8) * 0.3;
            blades.forEach((b, i) => { const a = (i / count) * Math.PI * 2; b.position.set(Math.cos(a) * open, Math.sin(a) * open, 0); b.rotation.z = a + Math.PI / 2; });
            g.rotation.z = t * 0.05;
        };
        return g;
    }

    function makeSculpture(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(-7, -1.5, 0));
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.6 })));
        const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.24, 90, 12), matB());
        knot.position.y = 1.3; g.add(knot);
        g.userData.animate = (t) => { knot.rotation.y = t * 0.4; knot.rotation.x = t * 0.15; };
        return g;
    }

    function makeGaming(pos) {
        const g = new THREE.Group(); g.position.copy(pos).add(new THREE.Vector3(7, -1, 0));
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.9), matA()); g.add(body);
        const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
        [[-0.5, 0.35, 0], [0.5, 0.35, 0]].forEach(([x, y, z]) => { const s = new THREE.Mesh(stickGeo, matB()); s.position.set(x, y, z); g.add(s); });
        const pixMeshes = [];
        const pixGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        for (let i = 0; i < 24; i++) { const p = new THREE.Mesh(pixGeo, i % 2 === 0 ? matA() : matB()); g.add(p); pixMeshes.push(p); }
        g.userData.animate = (t) => {
            pixMeshes.forEach((p, i) => {
                const a = t * 0.5 + i; const r = 1.6 + Math.sin(t + i) * 0.3;
                p.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 0.8, Math.sin(a) * r);
                p.rotation.x = t + i;
            });
            body.rotation.y = Math.sin(t * 0.4) * 0.15;
        };
        return g;
    }

    function makeVinyls(pos) {
        const g = new THREE.Group(); g.position.copy(pos);
        const recs = [];
        for (let i = 0; i < 4; i++) {
            const rec = new THREE.Group();
            rec.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.4, metalness: 0.2 })));
            rec.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), i % 2 === 0 ? matA() : matB()));
            const a = (i / 4) * Math.PI * 2;
            rec.position.set(Math.cos(a) * 4, Math.sin(a) * 1.6, Math.sin(a) * 4);
            rec.rotation.x = Math.PI / 2.4;
            g.add(rec); recs.push(rec);
        }
        g.userData.animate = (t) => { recs.forEach((r, i) => { r.rotation.z = t * (0.6 + i * 0.1); }); g.rotation.y = t * 0.05; };
        return g;
    }

    function makePhotoDrift(pos) {
        const g = new THREE.Group(); g.position.copy(pos);
        const loader = new THREE.TextureLoader();
        const files = ['source/photo1.jpg', 'source/photo2.jpg', 'source/photo3.jpg', 'source/photo4.jpg', 'source/photo5.jpg'];
        const planes = [];
        files.forEach((f, i) => {
            const mat = new THREE.MeshBasicMaterial({ color: 0x22252c, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), mat);
            const a = (i / files.length) * Math.PI * 2;
            plane.position.set(Math.cos(a) * 5, Math.sin(a * 0.7) * 2, Math.sin(a) * 5);
            plane.lookAt(pos);
            g.add(plane); planes.push(plane);
            loader.load(f, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true; }, undefined, () => {});
        });
        g.userData.animate = (t) => { planes.forEach((p, i) => { p.rotation.y = Math.sin(t * 0.2 + i) * 0.2; }); g.rotation.y = t * 0.03; };
        return g;
    }

    function makePortal(pos) {
        const g = new THREE.Group(); g.position.copy(pos);
        const rings = [];
        for (let i = 0; i < 5; i++) {
            const r = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.9, 0.05, 8, 32), i % 2 === 0 ? matA() : matB());
            g.add(r); rings.push(r);
        }
        addGlow(g, 0x3fd7ff, 10);
        g.userData.animate = (t) => { rings.forEach((r, i) => { r.rotation.z = t * 0.2 + i; r.scale.setScalar(1 + Math.sin(t * 0.8 + i) * 0.05); }); };
        return g;
    }

    const worldGroup = new THREE.Group();
    worldGroup.add(makeCore(waypoints[0]));
    worldGroup.add(makeConstellation(waypoints[1]));
    worldGroup.add(makeGateRings());
    worldGroup.add(makeMedallions(waypoints[3]));
    worldGroup.add(makeDance(waypoints[4]));
    worldGroup.add(makeSinger(waypoints[5]));
    worldGroup.add(makeCar(waypoints[6]));
    worldGroup.add(makePhotoRig(waypoints[7]));
    worldGroup.add(makeSculpture(waypoints[8]));
    worldGroup.add(makeGaming(waypoints[9]));
    worldGroup.add(makeVinyls(waypoints[10]));
    worldGroup.add(makePhotoDrift(waypoints[11]));
    worldGroup.add(makePortal(waypoints[12]));
    scene.add(worldGroup);

    setBootProgress(85, 'Access granted');

    /* ---- Scroll -> progress ---- */
    const track = document.getElementById('scroll-track');
    let targetProgress = 0;
    let currentProgress = 0;

    function computeProgress() {
        const max = track.offsetHeight - window.innerHeight;
        targetProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }
    window.addEventListener('scroll', computeProgress, { passive: true });
    computeProgress();

    /* ---- Chapter panel visibility ---- */
    const chapterEls = {};
    CHAPTERS.forEach(ch => { chapterEls[ch.id] = document.getElementById('chapter-' + ch.id); });
    const dotEls = document.querySelectorAll('.dot-item');

    function updateChapters(p) {
        let activeId = CHAPTERS[0].id;
        CHAPTERS.forEach(ch => {
            const [s, e] = ch.range;
            const fade = Math.min(0.025, (e - s) * 0.3);
            let opacity = 0;
            if (p >= s - fade && p <= e + fade) {
                if (p < s) opacity = (p - (s - fade)) / fade;
                else if (p > e) opacity = 1 - ((p - e) / fade);
                else opacity = 1;
            }
            opacity = Math.max(0, Math.min(1, opacity));
            const el = chapterEls[ch.id];
            if (!el) return;
            el.style.opacity = opacity;
            if (opacity > 0.5) { el.classList.add('active'); activeId = ch.id; }
            else { el.classList.remove('active'); }
        });
        const mapped = DOT_MAP[activeId];
        dotEls.forEach(d => d.classList.toggle('active', d.dataset.target === mapped));
    }

    /* ---- Dot-nav click -> jump ---- */
    dotEls.forEach(dot => {
        dot.addEventListener('click', () => {
            const ch = CHAPTERS.find(c => c.id === dot.dataset.target);
            if (!ch) return;
            const max = track.offsetHeight - window.innerHeight;
            window.scrollTo({ top: ch.range[0] * max + 4, behavior: 'smooth' });
        });
    });

    /* ---- Mouse parallax (desktop only) ---- */
    let mouseX = 0, mouseY = 0;
    if (isFinePointer && !prefersReduced) {
        window.addEventListener('mousemove', e => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    function updateCamera(p) {
        const camPos = curve.getPointAt(p);
        const lookPos = curve.getPointAt(Math.min(p + 0.015, 1));
        camera.position.copy(camPos);
        camera.lookAt(lookPos);
        if (isFinePointer && !prefersReduced) {
            camera.rotation.y += mouseX * 0.05;
            camera.rotation.x += mouseY * 0.03;
        }
    }

    /* ---- Resize ---- */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ---- Render loop ---- */
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        currentProgress += (targetProgress - currentProgress) * 0.08;
        updateCamera(currentProgress);
        updateChapters(currentProgress);
        worldGroup.children.forEach(c => { if (c.userData.animate) c.userData.animate(elapsed); });
        starfield.position.copy(camera.position);
        renderer.render(scene, camera);
    }

    setBootProgress(100, 'Access granted');
    updateChapters(0);
    animate();
    setTimeout(finishBoot, 350);

    initLightbox();
}

/* ---------- Entry point ---------- */
if (!hasWebGL()) {
    runFallback();
} else {
    runJourney().catch(err => {
        console.error('3D journey failed to initialize, falling back:', err);
        runFallback();
    });
}
