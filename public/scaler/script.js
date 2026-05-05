/* ============================================================
   SCALER ACADEMY — script.js
   ============================================================ */

   (function () {
    'use strict';

    // ─── Sticky header shadow on scroll ──────────────────────
    const header = document.getElementById('main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // ─── Mobile hamburger menu ────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const mainNav   = document.getElementById('main-nav');

    hamburger.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('mobile-open');
        hamburger.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav on nav link click (mobile)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('mobile-open');
            hamburger.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ─── Program ticker cycling ───────────────────────────────
    const programs = [
        'Data Science and ML with Specialisation in AI',
        'Advanced AIML with Agentic AI',
        'DevOps, Cloud & AI Platform Engineering',
        'Software Development (Backend & Full Stack)',
    ];

    const tickerItems = document.querySelectorAll('.ticker-item');
    let activeIndex = 1; // start on the 2nd item

    // We only have 3 ticker slots (dim | active | dim)
    function updateTicker(newActive) {
        const prev = (newActive - 1 + programs.length) % programs.length;
        const next = (newActive + 1) % programs.length;

        if (tickerItems.length === 3) {
            tickerItems[0].textContent = programs[prev];
            tickerItems[1].textContent = programs[newActive];
            tickerItems[2].textContent = programs[next];
        }
    }

    setInterval(() => {
        activeIndex = (activeIndex + 1) % programs.length;
        updateTicker(activeIndex);
    }, 3000);

    // ─── Callback Modal ───────────────────────────────────────
    const modalOverlay  = document.getElementById('modal-overlay');
    const btnCallback   = document.getElementById('btn-callback');
    const modalClose    = document.getElementById('modal-close');
    const modalSubmit   = document.getElementById('modal-submit');
    const modalSuccess  = document.getElementById('modal-success');

    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Reset form state
        modalSuccess.style.display = 'none';
        document.getElementById('cb-name').value  = '';
        document.getElementById('cb-phone').value = '';
        document.getElementById('cb-email').value = '';
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (btnCallback)  btnCallback.addEventListener('click', openModal);
    if (modalClose)   modalClose.addEventListener('click', closeModal);

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    // Submit
    if (modalSubmit) {
        modalSubmit.addEventListener('click', () => {
            const name  = document.getElementById('cb-name').value.trim();
            const phone = document.getElementById('cb-phone').value.trim();
            const email = document.getElementById('cb-email').value.trim();

            if (!name || !phone || !email) {
                // Shake empty fields
                [
                    { id: 'cb-name',  val: name },
                    { id: 'cb-phone', val: phone },
                    { id: 'cb-email', val: email },
                ].forEach(({ id, val }) => {
                    if (!val) {
                        const el = document.getElementById(id);
                        el.style.borderColor = '#ef4444';
                        el.style.animation = 'shake 0.3s ease';
                        setTimeout(() => {
                            el.style.animation = '';
                            el.style.borderColor = '';
                        }, 400);
                    }
                });
                return;
            }

            // Simulate submission
            modalSubmit.textContent = 'Submitting…';
            modalSubmit.disabled = true;

            setTimeout(() => {
                modalSubmit.textContent = 'Submit Request';
                modalSubmit.disabled = false;
                modalSuccess.style.display = 'block';

                setTimeout(closeModal, 2000);
            }, 1200);
        });
    }

    // ─── Add shake keyframes dynamically ─────────────────────
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25%       { transform: translateX(-6px); }
            75%       { transform: translateX(6px); }
        }
    `;
    document.head.appendChild(style);

    // ─── Scroll-reveal for stats ──────────────────────────────
    const statNums = document.querySelectorAll('.stat-num');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    statNums.forEach(el => {
        el.style.opacity  = '0';
        el.style.transform = 'translateY(12px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(el);
    });

    console.log('Scaler Academy — script loaded ✓');

})();