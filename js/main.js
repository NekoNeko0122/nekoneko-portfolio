/* ── Theme Toggle ────────────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    initCanvas(); // re-draw canvas with new theme colors
});

/* ── Nav: scroll + active ─────────────────────────── */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}, { passive: true });

/* ── Mobile Menu ─────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileLinks.classList.toggle('open');
});

mobileLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileLinks.classList.remove('open');
    });
});

/* ── Background Canvas: Floating Paw Prints ─────────── */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let animFrame;
let paws = [];

class Paw {
    constructor(init) { this.spawn(init); }

    spawn(init) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : canvas.height + 50;
        this.sc = Math.random() * 1.1 + 0.25;
        this.a  = 0;
        this.ta = Math.random() * 0.15 + 0.04;
        const angle = Math.random() * Math.PI * 2;
        const spd   = Math.random() * 0.45 + 0.1;
        this.vx  = Math.cos(angle) * spd;
        this.vy  = Math.sin(angle) * spd - 0.25; // bias upward
        this.rot = Math.random() * Math.PI * 2;
        this.rs  = (Math.random() - 0.5) * 0.007;
        this.age  = 0;
        this.life = Math.floor(Math.random() * 380) + 180;
    }

    draw() {
        const s     = this.sc;
        const light = html.getAttribute('data-theme') === 'light';
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = light
            ? `rgba(190,18,60,${this.a})`
            : `rgba(239,68,68,${this.a})`;

        ctx.beginPath();
        ctx.ellipse(0, 3 * s, 8 * s, 7 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        [[-10, -11], [-3.5, -18], [3.5, -18], [10, -11]].forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.arc(tx * s, ty * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    update() {
        this.x   += this.vx;
        this.y   += this.vy;
        this.rot += this.rs;
        this.age++;

        const fadeOut = this.age > this.life * 0.72;
        this.a = fadeOut
            ? Math.max(this.a - 0.003, 0)
            : Math.min(this.a + 0.004, this.ta);

        const off = 60;
        if (
            this.age > this.life ||
            this.x < -off || this.x > canvas.width  + off ||
            this.y < -off || this.y > canvas.height + off
        ) this.spawn(false);
    }
}

function initCanvas() {
    cancelAnimationFrame(animFrame);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const n = Math.min(Math.floor(canvas.width * canvas.height / 14000), 38);
    paws = Array.from({ length: n }, (_, i) => new Paw(true));
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paws.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(initCanvas, 200);
}, { passive: true });

window.addEventListener('load', initCanvas);

/* ── Typewriter Effect ───────────────────────────── */
const phrases = [
    'seamless web experiences',
    'mobile apps that ship',
    'robust fullstack systems',
    'clean, modern interfaces',
    'AI-powered solutions',
    'efficient backend APIs',
];
let phraseIdx = 0;
let charIdx = 0;
let deleting = false;
let twPause = false;
const twEl = document.getElementById('typewriter');

function typewrite() {
    const phrase = phrases[phraseIdx];

    if (twPause) {
        setTimeout(typewrite, 1600);
        twPause = false;
        return;
    }

    if (!deleting) {
        twEl.textContent = phrase.slice(0, ++charIdx);
        if (charIdx === phrase.length) {
            deleting = true;
            twPause = true;
        }
        setTimeout(typewrite, 70);
    } else {
        twEl.textContent = phrase.slice(0, --charIdx);
        if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
        }
        setTimeout(typewrite, 38);
    }
}

setTimeout(typewrite, 1200);

/* ── Scroll Reveal ───────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

/* ── Counter Animation ───────────────────────────── */
const statNums = document.querySelectorAll('.stat-num[data-target]');

function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1600;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

/* ── Portfolio Filter ────────────────────────────── */
const filterBtns = document.querySelectorAll('.flt-btn');
const projCards = document.querySelectorAll('.proj-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        projCards.forEach(card => {
            const match = filter === 'all' || card.dataset.category === filter;
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            if (!match) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.94)';
                setTimeout(() => { card.style.display = 'none'; }, 300);
            } else {
                card.style.display = '';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = '';
                    });
                });
            }
        });
    });
});

/* ── Contact Form ────────────────────────────────── */
const form = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(form);
    const json = Object.fromEntries(data.entries());

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(json)
        });
        const result = await res.json();
        if (result.success) {
            form.reset();
            showToast('Message received! I\'ll get back to you soon.');
        } else {
            showToast('Something went wrong. Please try again.');
        }
    } catch {
        showToast('Network error. Please check your connection.');
    } finally {
        btn.textContent = 'Send Message';
        btn.disabled = false;
    }
});

/* ── Custom Cursor (desktop) ─────────────────────── */
if (window.matchMedia('(hover: hover)').matches) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    let ready = false;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!ready) {
            ready = true;
            document.body.classList.add('cursor-ready');
        }
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    }, { passive: true });

    function smoothRing() {
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(smoothRing);
    }
    smoothRing();

    document.querySelectorAll('a, button, .proj-card, .stat-card, .flt-btn').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
}

/* ── Smooth scroll for logo ──────────────────────── */
document.querySelector('.nav-logo').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
