/* ============================================================
   KUNAL PANIGRAHI — PORTFOLIO INTERACTIONS
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

/* ---------- 1. Boot / access sequence ---------- */
const boot = document.getElementById('boot');
document.body.classList.add('booting');

function finishBoot() {
    document.body.classList.remove('booting');
    if (boot) {
        boot.classList.add('boot-hide');
        setTimeout(() => { boot.style.display = 'none'; }, 950);
    }
    startTypingEffect();
}

if (prefersReduced) {
    if (boot) boot.style.display = 'none';
    document.body.classList.remove('booting');
    startTypingEffect();
} else {
    // Shorter, snappier intro on small screens
    const isSmallScreen = window.matchMedia('(max-width: 600px)').matches;
    if (isSmallScreen && boot) {
        const delays = [0, 0.45, 0.9];
        boot.querySelectorAll('.boot-line').forEach((line, idx) => {
            line.style.animationDelay = delays[idx] + 's';
        });
    }
    setTimeout(finishBoot, isSmallScreen ? 1500 : 2500);
    // allow skipping the intro with a click/tap
    if (boot) boot.addEventListener('click', finishBoot);
}

/* ---------- 2. Mobile nav toggle ---------- */
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const navOverlay = document.querySelector('.nav-overlay');

function closeMobileNav() {
    document.body.classList.remove('mobile-nav-active');
    if (navOverlay) navOverlay.classList.remove('active');
    if (mobileNavToggle) {
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}

if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function () {
        const isOpen = document.body.classList.toggle('mobile-nav-active');
        if (navOverlay) navOverlay.classList.toggle('active', isOpen);
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-xmark');
    });
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
    if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
}

/* ---------- 3. Active link switching on scroll + progress bar ---------- */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu a');
const progressBar = document.getElementById('progress');

function onScroll() {
    let current = 'hero';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });

    if (progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- 4. Scroll reveal (Intersection Observer) ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.hidden').forEach(el => revealObserver.observe(el));

/* ---------- 5. Timeline "draw" line ---------- */
const timeline = document.querySelector('.timeline');
if (timeline) {
    const timelineObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                timeline.classList.add('draw');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    timelineObserver.observe(timeline);
}

/* ---------- 6. Typing effect for hero role ---------- */
const words = [
    'Identity & Access Professional',
    'Solo Dancer',
    'Singer',
    'Automotive Enthusiast',
    'Photographer',
    '3D Artist',
    'Game Developer & Gamer'
];

let wordIndex = 0;
let typeTimer;

function startTypingEffect() {
    const typedTextEl = document.getElementById('typed-text');
    if (!typedTextEl || typedTextEl.dataset.started) return;
    typedTextEl.dataset.started = 'true';
    typingEffect();
}

function getArticle(word) {
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

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

/* ---------- 7. Local clock in sidebar footer ---------- */
const clockEl = document.getElementById('local-clock');
if (clockEl) {
    function tickClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `LOCAL ${h}:${m}:${s}`;
    }
    tickClock();
    setInterval(tickClock, 1000);
}

/* ---------- 8. Custom cursor (desktop, fine pointer, motion allowed) ---------- */
if (isFinePointer && !prefersReduced) {
    document.body.classList.add('cursor-ready');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .card, .cert-card, .gallery-item').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });
}

/* ---------- 9. Magnetic buttons (desktop only) ---------- */
if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

/* ---------- 10. Gallery lightbox ---------- */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
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
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });
}
