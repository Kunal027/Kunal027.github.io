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
const sections = document.querySelectorAll('section');
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

// 3. Smooth Cinematic Scroll Animations 
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); 
        }
    });
}, { 
    threshold: 0.1, // Triggers slightly earlier for a smoother flow
    rootMargin: "0px 0px -20px 0px"
});

document.querySelectorAll('.hidden').forEach((el) => {
    observer.observe(el);
});

// 4. Creative Typing Effect for Hero Section
const words = [
    "Identity & Access Professional",
    "Solo Dancer",
    "Singer",
    "Automotive Enthusiast",
    "Photographer",
    "3D Artist",
    "Game Developer & Gamer"
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
        timer = setTimeout(loopTyping, 100);
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
        timer = setTimeout(loopDeleting, 50); 
    };
    loopDeleting();
}

window.addEventListener('DOMContentLoaded', () => {
    typingEffect();
});