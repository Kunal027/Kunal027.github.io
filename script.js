/* ============================================================
   KUNAL PANIGRAHI — PERSONAL PORTFOLIO
   Handles the mobile menu toggle, active section highlighting, 
   smooth reveal-on-scroll animations, typing effect, and lightbox.
   ============================================================ */

// 1. Mobile Navigation Toggle
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function() {
        document.body.classList.toggle('mobile-nav-active');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-xmark');
    });
}

// 2. Active link switching on scroll
const sections = document.querySelectorAll('section.chapter');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// 3. Smooth Cinematic Scroll Animations (Intersection Observer)
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, { 
    threshold: 0.1, // Triggers when 10% of the element is visible
    rootMargin: "0px 0px -50px 0px"
});

document.querySelectorAll('.chapter-inner').forEach((el) => {
    observer.observe(el);
});

// 4. Creative Typing Effect for Hero Section
const words = [
    'Identity & Access Management Professional',
    'Solo Dancer',
    'Singer',
    'Automotive Enthusiast',
    'Photographer',
    '3D Artist',
    'Game Developer & Gamer'
];

let i = 0;
let timer;

function typingEffect() {
    let word = words[i].split("");
    let typedTextEl = document.getElementById('typed-text');
    
    if (!typedTextEl) return;

    let loopTyping = function() {
        if (word.length > 0) {
            typedTextEl.innerHTML += word.shift();
        } else {
            setTimeout(deletingEffect, 2000); 
            return false;
        }
        timer = setTimeout(loopTyping, 90);
    };
    loopTyping();
}

function deletingEffect() {
    let word = words[i].split("");
    let typedTextEl = document.getElementById('typed-text');
    
    let loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            typedTextEl.innerHTML = word.join("");
        } else {
            if (words.length > (i + 1)) { 
                i++; 
            } else { 
                i = 0; 
            }
            typingEffect();
            return false;
        }
        timer = setTimeout(loopDeleting, 45); 
    };
    loopDeleting();
}

window.addEventListener('DOMContentLoaded', () => {
    // Start typing effect when the page loads
    typingEffect();

    // 5. Lightbox for gallery
    const lightbox = document.getElementById('lightbox');
    const lbImg = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.lb-close');
    
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            lbImg.src = img.src;
            lbImg.alt = img.alt;
            lightbox.classList.add('open');
        });
    });

    lbClose.addEventListener('click', () => {
        lightbox.classList.remove('open');
    });

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('open');
        }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            lightbox.classList.remove('open');
        }
    });
});