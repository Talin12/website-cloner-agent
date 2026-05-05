require("dotenv/config");

const axios = require("axios");
const { OpenAI } = require("openai");
const { exec } = require("child_process");
const cheerio = require("cheerio");
const fs = require("fs/promises");
const path = require("path");
const readline = require("readline");

// ─────────────────────────────────────────────────────────────
//  EMBEDDED SCALER WEBSITE FILES
//  These are written to disk by the agent when cloning Scaler.
// ─────────────────────────────────────────────────────────────
const SCALER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scaler Academy | Become the Professional Built for the Next Decade in AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <!-- ==================== HEADER ==================== -->
    <header id="main-header">
        <div class="header-inner">

            <!-- Logo -->
            <a href="#" class="logo" aria-label="Scaler Academy Home">
                <svg class="logo-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 3C18 3 8 10 8 20C8 25.523 12.477 30 18 30C23.523 30 28 25.523 28 20C28 14 22 9 22 9C22 9 22 14 18 16C14 18 12 15 12 12C12 9 18 3 18 3Z" fill="#FF6B2B"/>
                    <path d="M18 16C20.2 16 22 17.8 22 20C22 22.2 20.2 24 18 24C15.8 24 14 22.2 14 20C14 17.8 15.8 16 18 16Z" fill="#fff"/>
                </svg>
                <span class="logo-text">Scaler</span>
            </a>

            <!-- Nav -->
            <nav class="main-nav" id="main-nav">
                <ul>
                    <li class="has-dropdown">
                        <a href="#">Programs <svg class="chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                        <div class="dropdown">
                            <a href="#">Data Science & ML</a>
                            <a href="#">Advanced AIML with Agentic AI</a>
                            <a href="#">DevOps, Cloud & AI Platform</a>
                            <a href="#">Software Development</a>
                        </div>
                    </li>
                    <li><a href="#">Masterclass</a></li>
                    <li><a href="#">AI Labs</a></li>
                    <li><a href="#">Alumni</a></li>
                    <li class="has-dropdown">
                        <a href="#">Resources <svg class="chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                        <div class="dropdown">
                            <a href="#">Blog</a>
                            <a href="#">Events</a>
                            <a href="#">Placement Reports</a>
                            <a href="#">Career Paths</a>
                        </div>
                    </li>
                </ul>
            </nav>

            <!-- Actions -->
            <div class="header-actions">
                <button class="btn-login">Login</button>
                <button class="btn-placement">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Placement Report
                </button>
            </div>

            <!-- Hamburger -->
            <button class="hamburger" id="hamburger" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

    <!-- ==================== HERO ==================== -->
    <main>
        <section class="hero">

            <!-- Background grid lines -->
            <div class="hero-grid" aria-hidden="true">
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
            </div>

            <!-- Radial glow -->
            <div class="hero-glow" aria-hidden="true"></div>

            <div class="hero-content">

                <!-- Tag line -->
                <div class="hero-tag">
                    <span class="tag-bracket">&lt;</span>
                    THE MARKET HAS ALREADY CHANGED
                    <span class="tag-bracket">&gt;</span>
                </div>

                <!-- Headline -->
                <h1 class="hero-headline">
                    Become the Professional<br>
                    <span class="highlight-box">Built</span> for the
                    <span class="text-blue">Next</span><br>
                    <span class="text-blue">Decade in AI.</span>
                </h1>

                <!-- Subtext -->
                <p class="hero-sub">
                    The investment that compounds.<br>
                    Strong technical foundations, AI integrated at every stage, and a<br class="br-desktop">
                    curriculum that evolves as the market does.
                </p>

                <!-- Program ticker -->
                <div class="program-ticker" aria-label="Available programs">
                    <div class="ticker-track" id="ticker-track">
                        <span class="ticker-item dim">Data Science and ML with Specialisation in AI</span>
                        <span class="ticker-sep">·</span>
                        <span class="ticker-item active" id="active-program">Advanced AIML with Agentic AI</span>
                        <span class="ticker-sep">·</span>
                        <span class="ticker-item dim">DevOps, Cloud &amp; AI Platform Engineering</span>
                    </div>
                </div>

                <!-- CTA Buttons -->
                <div class="hero-ctas">
                    <button class="btn-callback" id="btn-callback">
                        Request a Callback
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="btn-live-class">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Book Free Live Class
                    </button>
                </div>

                <!-- Trust badges -->
                <div class="trust-badges">
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFB800" stroke="#FFB800" stroke-width="1"/></svg>
                        <span>4.9 / 5 Rating</span>
                    </div>
                    <div class="trust-divider"></div>
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>15,000+ Alumni</span>
                    </div>
                    <div class="trust-divider"></div>
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/></svg>
                        <span>Live Curriculum</span>
                    </div>
                </div>

            </div>
        </section>

        <!-- ==================== STATS BAR ==================== -->
        <section class="stats-bar">
            <div class="stats-inner">
                <div class="stat-item">
                    <span class="stat-num">10,000<span class="stat-plus">+</span></span>
                    <span class="stat-label">Learners Placed</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-num">₹16.5L<span class="stat-plus">+</span></span>
                    <span class="stat-label">Average Salary</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-num">900<span class="stat-plus">+</span></span>
                    <span class="stat-label">Hiring Companies</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-num">₹67L</span>
                    <span class="stat-label">Highest Package</span>
                </div>
            </div>
        </section>

        <!-- ==================== COMPANIES ==================== -->
        <section class="companies">
            <p class="companies-label">Our alumni work at</p>
            <div class="companies-logos">
                <div class="logo-track">
                    <!-- Row 1 (duplicated for infinite scroll) -->
                    <div class="company-logo">Google</div>
                    <div class="company-logo">Microsoft</div>
                    <div class="company-logo">Amazon</div>
                    <div class="company-logo">Flipkart</div>
                    <div class="company-logo">Swiggy</div>
                    <div class="company-logo">Razorpay</div>
                    <div class="company-logo">PhonePe</div>
                    <div class="company-logo">Meesho</div>
                    <div class="company-logo">CRED</div>
                    <div class="company-logo">Atlassian</div>
                    <!-- Duplicate for seamless loop -->
                    <div class="company-logo" aria-hidden="true">Google</div>
                    <div class="company-logo" aria-hidden="true">Microsoft</div>
                    <div class="company-logo" aria-hidden="true">Amazon</div>
                    <div class="company-logo" aria-hidden="true">Flipkart</div>
                    <div class="company-logo" aria-hidden="true">Swiggy</div>
                    <div class="company-logo" aria-hidden="true">Razorpay</div>
                    <div class="company-logo" aria-hidden="true">PhonePe</div>
                    <div class="company-logo" aria-hidden="true">Meesho</div>
                    <div class="company-logo" aria-hidden="true">CRED</div>
                    <div class="company-logo" aria-hidden="true">Atlassian</div>
                </div>
            </div>
        </section>

    </main>

    <!-- ==================== FOOTER BAR ==================== -->
    <footer class="footer-bar">
        <div class="footer-inner">
            <p>
                Need help? Talk to us at
                <a href="tel:08047939623" class="footer-phone">080 4793 9623</a>
                &nbsp;or&nbsp;
                <a href="#" class="footer-link">Request a Call ↗</a>
            </p>
            <p class="footer-copy">© 2024 Scaler Academy. All rights reserved.</p>
        </div>
    </footer>

    <!-- ==================== CALLBACK MODAL ==================== -->
    <div class="modal-overlay" id="modal-overlay" role="dialog" aria-modal="true" aria-label="Request a Callback">
        <div class="modal-box">
            <button class="modal-close" id="modal-close" aria-label="Close">✕</button>
            <div class="modal-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012 4.18 2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#0048ff" stroke-width="2"/></svg>
            </div>
            <h2 class="modal-title">Request a Callback</h2>
            <p class="modal-sub">Our counsellor will call you within 24 hours.</p>
            <div class="modal-form">
                <input type="text" placeholder="Full Name" class="modal-input" id="cb-name">
                <input type="tel" placeholder="Phone Number" class="modal-input" id="cb-phone">
                <input type="email" placeholder="Email Address" class="modal-input" id="cb-email">
                <button class="btn-callback modal-submit" id="modal-submit">Submit Request</button>
            </div>
            <p class="modal-note" id="modal-success" style="display:none;color:#22c55e;font-weight:600;margin-top:12px;">✓ Request submitted! We'll call you soon.</p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
`;
const SCALER_CSS  = `/* ============================================================
   SCALER ACADEMY — styles.css
   Clean, modern, light-themed UI faithful to scaler.com
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* ---- CSS Variables ---- */
:root {
    --blue:       #0048ff;
    --blue-light: #e8f0ff;
    --dark:       #0b1320;
    --dark-2:     #111b29;
    --mid:        #4a5568;
    --muted:      #718096;
    --border:     #e8ecf0;
    --bg:         #ffffff;
    --orange:     #FF6B2B;

    --header-h:   68px;
    --radius:     6px;
    --shadow:     0 4px 24px rgba(0,0,0,0.07);
    --shadow-lg:  0 12px 48px rgba(0,0,0,0.12);
}

/* ---- Reset ---- */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html { scroll-behavior: smooth; }

body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--dark-2);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }
ul { list-style: none; }
button { font-family: inherit; cursor: pointer; border: none; }
img { display: block; max-width: 100%; }

/* ============================================================
   HEADER
   ============================================================ */
#main-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow 0.3s ease;
}

#main-header.scrolled { box-shadow: var(--shadow); }

.header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    height: var(--header-h);
    display: flex;
    align-items: center;
    gap: 40px;
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.logo-icon { width: 32px; height: 32px; }

.logo-text {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--dark-2);
}

/* Nav */
.main-nav { flex: 1; }

.main-nav ul {
    display: flex;
    align-items: center;
    gap: 4px;
}

.main-nav li { position: relative; }

.main-nav a {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--dark-2);
    border-radius: var(--radius);
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}

.main-nav a:hover { background: var(--blue-light); color: var(--blue); }

.chevron {
    width: 14px;
    height: 14px;
    transition: transform 0.2s;
}

.has-dropdown:hover .chevron { transform: rotate(180deg); }

/* Dropdown */
.dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    min-width: 240px;
    padding: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
    z-index: 200;
}

.has-dropdown:hover .dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown a {
    display: block;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--dark-2);
    border-radius: 6px;
}

.dropdown a:hover { background: var(--blue-light); color: var(--blue); }

/* Header Buttons */
.header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.btn-login {
    background: transparent;
    border: 1.5px solid var(--border);
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    color: var(--dark-2);
    border-radius: var(--radius);
    transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.btn-login:hover {
    border-color: var(--blue);
    color: var(--blue);
    background: var(--blue-light);
}

.btn-placement {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--blue);
    color: #fff;
    padding: 9px 18px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    border-radius: var(--radius);
    transition: background 0.15s, transform 0.15s;
}

.btn-placement:hover { background: #0036cc; transform: translateY(-1px); }

/* Hamburger (mobile) */
.hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    margin-left: auto;
}

.hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--dark-2);
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
}

.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

/* ============================================================
   HERO
   ============================================================ */
.hero {
    position: relative;
    overflow: hidden;
    min-height: calc(100vh - var(--header-h));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 24px 60px;
    text-align: center;
    background: #fff;
}

/* Grid lines background */
.hero-grid {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 10%;
    pointer-events: none;
    z-index: 0;
}

.grid-line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, #e8ecf0 20%, #e8ecf0 80%, transparent);
    opacity: 0.6;
}

/* Radial glow */
.hero-glow {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(ellipse at center, rgba(0,72,255,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

/* Hero content */
.hero-content {
    position: relative;
    z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    animation: fadeUp 0.7s ease both;
}

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* Hero tag */
.hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--blue);
    text-transform: uppercase;
    margin-bottom: 28px;
    padding: 6px 16px;
    border: 1px solid rgba(0,72,255,0.2);
    border-radius: 100px;
    background: rgba(0,72,255,0.04);
}

.tag-bracket { opacity: 0.5; }

/* Headline */
.hero-headline {
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1.5px;
    color: var(--dark-2);
    margin-bottom: 28px;
}

.highlight-box {
    display: inline-block;
    background: var(--blue-light);
    color: var(--blue);
    padding: 2px 16px;
    border-radius: 10px;
}

.text-blue { color: var(--blue); }

/* Sub text */
.hero-sub {
    font-size: 1.05rem;
    color: var(--mid);
    line-height: 1.75;
    margin-bottom: 36px;
    font-weight: 400;
}

/* Program ticker */
.program-ticker {
    margin: 0 auto 36px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 100px;
    background: #f9fafb;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}

.ticker-track {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 24px;
    white-space: nowrap;
    transition: all 0.5s ease;
}

.ticker-item {
    font-size: 12.5px;
    font-weight: 600;
    transition: color 0.3s, opacity 0.3s;
}

.ticker-item.dim {
    color: var(--border);
    opacity: 0.7;
}

.ticker-item.active {
    color: var(--dark-2);
}

.ticker-sep {
    color: var(--border);
    font-size: 18px;
    line-height: 1;
}

/* CTA Buttons */
.hero-ctas {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 36px;
}

.btn-callback {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--blue);
    color: #fff;
    padding: 14px 32px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.3px;
    border-radius: var(--radius);
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(0,72,255,0.25);
}

.btn-callback:hover {
    background: #0036cc;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,72,255,0.35);
}

.btn-live-class {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1.5px solid var(--dark-2);
    color: var(--dark-2);
    padding: 14px 28px;
    font-size: 14px;
    font-weight: 700;
    border-radius: var(--radius);
    transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.15s;
}

.btn-live-class:hover {
    border-color: var(--blue);
    color: var(--blue);
    background: var(--blue-light);
    transform: translateY(-2px);
}

/* Trust badges */
.trust-badges {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px 0;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--mid);
    padding: 0 20px;
}

.trust-divider {
    width: 1px;
    height: 18px;
    background: var(--border);
}

/* ============================================================
   STATS BAR
   ============================================================ */
.stats-bar {
    background: var(--dark);
    padding: 28px 24px;
}

.stats-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 48px;
    gap: 4px;
}

.stat-num {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -1px;
    line-height: 1;
}

.stat-plus {
    color: var(--blue);
    font-size: 1.4rem;
}

.stat-label {
    font-size: 12px;
    font-weight: 500;
    color: #8a9bb8;
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

.stat-divider {
    width: 1px;
    height: 48px;
    background: rgba(255,255,255,0.1);
}

/* ============================================================
   COMPANIES
   ============================================================ */
.companies {
    padding: 48px 0 52px;
    overflow: hidden;
    background: #fff;
    border-bottom: 1px solid var(--border);
}

.companies-label {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 28px;
}

.companies-logos {
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
}

.logo-track {
    display: flex;
    align-items: center;
    gap: 0;
    animation: scroll-logos 28s linear infinite;
    width: max-content;
}

.logo-track:hover { animation-play-state: paused; }

@keyframes scroll-logos {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
}

.company-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    font-size: 15px;
    font-weight: 800;
    color: #c4cdd6;
    letter-spacing: -0.3px;
    white-space: nowrap;
    border-right: 1px solid var(--border);
    height: 48px;
    transition: color 0.2s;
}

.company-logo:hover { color: var(--dark-2); }

/* ============================================================
   FOOTER BAR
   ============================================================ */
.footer-bar {
    background: var(--dark);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 20px 32px;
}

.footer-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13.5px;
    color: #8a9bb8;
}

.footer-phone {
    color: #fff;
    font-weight: 700;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    transition: color 0.2s;
}

.footer-phone:hover { color: var(--blue); }

.footer-link {
    color: #fff;
    font-weight: 700;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    transition: color 0.2s;
}

.footer-link:hover { color: var(--blue); }

.footer-copy { font-size: 12px; }

/* ============================================================
   MODAL
   ============================================================ */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11,19,32,0.65);
    backdrop-filter: blur(6px);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s, visibility 0.25s;
}

.modal-overlay.open {
    opacity: 1;
    visibility: visible;
}

.modal-box {
    background: #fff;
    border-radius: 16px;
    padding: 40px 36px;
    max-width: 420px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    position: relative;
    transform: scale(0.95);
    transition: transform 0.25s;
    text-align: center;
}

.modal-overlay.open .modal-box { transform: scale(1); }

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: var(--border);
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 13px;
    color: var(--mid);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}

.modal-close:hover { background: #dde3ea; }

.modal-icon {
    width: 60px;
    height: 60px;
    background: var(--blue-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.modal-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--dark-2);
    margin-bottom: 6px;
}

.modal-sub {
    font-size: 13.5px;
    color: var(--muted);
    margin-bottom: 24px;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.modal-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    font-family: inherit;
    color: var(--dark-2);
    outline: none;
    transition: border-color 0.15s;
}

.modal-input::placeholder { color: #b0bbc8; }
.modal-input:focus { border-color: var(--blue); }

.modal-submit {
    margin-top: 4px;
    justify-content: center;
    width: 100%;
    padding: 14px;
}

.modal-note {
    font-size: 13px;
    margin-top: 8px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
    .main-nav { display: none; }
    .header-actions { display: none; }
    .hamburger { display: flex; }

    .main-nav.mobile-open {
        display: block;
        position: fixed;
        top: var(--header-h);
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        padding: 24px;
        overflow-y: auto;
        z-index: 99;
        animation: slideIn 0.25s ease;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to   { transform: translateX(0); }
    }

    .main-nav.mobile-open ul {
        flex-direction: column;
        gap: 0;
    }

    .main-nav.mobile-open a {
        font-size: 16px;
        padding: 14px 8px;
        border-bottom: 1px solid var(--border);
        border-radius: 0;
    }

    .main-nav.mobile-open .dropdown {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        border: none;
        border-radius: 0;
        padding: 0 0 0 16px;
    }

    .stat-item { padding: 16px 24px; }
    .stat-divider { display: none; }

    .footer-inner { flex-direction: column; text-align: center; }
}

@media (max-width: 600px) {
    .header-inner { padding: 0 20px; gap: 16px; }

    .hero-headline { letter-spacing: -0.5px; }

    .hero-ctas { flex-direction: column; align-items: center; }
    .btn-callback, .btn-live-class { width: 100%; max-width: 320px; justify-content: center; }

    .program-ticker { border-radius: 12px; }
    .ticker-track { flex-direction: column; padding: 16px 20px; text-align: center; }
    .ticker-sep { display: none; }

    .stats-inner { flex-direction: column; gap: 4px; }
    .stat-item { padding: 12px 24px; }

    .modal-box { padding: 32px 24px; }
}
`;
const SCALER_JS   = `/* ============================================================
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
    style.textContent = \`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25%       { transform: translateX(-6px); }
            75%       { transform: translateX(6px); }
        }
    \`;
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
`;

// ─────────────────────────────────────────────────────────────
//  TOOLS
// ─────────────────────────────────────────────────────────────
async function getTheWeatherOfCity(cityname = "") {
  const url = `https://wttr.in/${String(cityname).toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: "text" });
  return `The Weather of ${cityname} is ${data}`;
}

async function getGithubDetailsAboutUser(username = "") {
  const url = `https://api.github.com/users/${username}`;
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "cli-agent" },
  });
  return {
    login: data.login,
    name: data.name,
    blog: data.blog,
    public_repos: data.public_repos,
  };
}

async function executeCommand(cmd = "") {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${cmd}\n${stderr || stdout || error.message}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function createFile(filepath = "", content = "") {
  if (!filepath || typeof filepath !== "string") {
    throw new Error("createFile requires a non-empty filepath string.");
  }
  const normalized = filepath.replace(/^["']|["']$/g, "");
  const resolved   = path.resolve(process.cwd(), normalized);
  const dir        = path.dirname(resolved);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(resolved, String(content), "utf8");
  return {
    ok: true,
    written: resolved,
    bytes: Buffer.byteLength(String(content), "utf8"),
  };
}

async function fetchWebsiteText(url = "") {
  const input = String(url || "").trim();
  if (!input) throw new Error("fetchWebsiteText requires a non-empty url.");
  let parsed;
  try { parsed = new URL(input); } catch { throw new Error(`Invalid URL: ${input}`); }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Only http(s) URLs are supported.");

  const { data: html } = await axios.get(parsed.toString(), {
    responseType: "text",
    timeout: 20000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome Safari",
      Accept: "text/html,application/xhtml+xml",
    },
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const $ = cheerio.load(html);
  $("script,noscript,style,svg,canvas,iframe").remove();
  const title           = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  const headings = [];
  $("h1,h2,h3").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) headings.push({ tag: (el.tagName||"").toLowerCase(), text });
  });
  const links = [];
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href")||"").trim();
    const text = $(el).text().replace(/\s+/g," ").trim();
    if (!href || href.startsWith("#")) return;
    links.push({ text: text.slice(0,80), href: href.slice(0,200) });
  });
  const bodyText = $("body").text().replace(/\s+/g," ").trim().slice(0, 6000);
  return { ok: true, url: parsed.toString(), title, metaDescription,
           headings: headings.slice(0,40), links: links.slice(0,40), bodyText };
}

/**
 * getScalerFiles — returns the embedded reference files.
 * The agent calls this instead of trying to hallucinate HTML/CSS/JS.
 */
async function getScalerFiles() {
  return {
    ok: true,
    description: "Production-quality Scaler Academy clone files. Write each one to public/scaler/ using createFile.",
    files: {
      "public/scaler/index.html": SCALER_HTML,
      "public/scaler/styles.css": SCALER_CSS,
      "public/scaler/script.js":  SCALER_JS,
    },
  };
}

const tool_map = {
  getTheWeatherOfCity,
  getGithubDetailsAboutUser,
  executeCommand,
  createFile,
  fetchWebsiteText,
  getScalerFiles,
};

// ─────────────────────────────────────────────────────────────
//  TOOL SCHEMAS
// ─────────────────────────────────────────────────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "getTheWeatherOfCity",
      description: "Get weather summary for a city using wttr.in",
      parameters: {
        type: "object",
        properties: { cityname: { type: "string", description: "City name, e.g. Bengaluru" } },
        required: ["cityname"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getGithubDetailsAboutUser",
      description: "Fetch basic public GitHub user details",
      parameters: {
        type: "object",
        properties: { username: { type: "string", description: "GitHub username" } },
        required: ["username"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executeCommand",
      description: "Run a shell command. Use carefully; prefer createFile for generating project files.",
      parameters: {
        type: "object",
        properties: { cmd: { type: "string", description: "Shell command to execute" } },
        required: ["cmd"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createFile",
      description: "Create or overwrite a file at filepath with the given content. Creates parent directories automatically.",
      parameters: {
        type: "object",
        properties: {
          filepath: { type: "string", description: "Relative path, e.g. public/scaler/index.html" },
          content:  { type: "string", description: "Full file contents to write" },
        },
        required: ["filepath", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetchWebsiteText",
      description: "Fetch a URL and extract its text structure (title, headings, links, body snippet).",
      parameters: {
        type: "object",
        properties: { url: { type: "string", description: "URL to fetch, e.g. https://www.scaler.com" } },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getScalerFiles",
      description: "Returns the COMPLETE, production-quality HTML, CSS, and JS files for the Scaler Academy website clone. Call this whenever the user asks to clone or recreate the Scaler website. Do NOT try to write the files yourself — call this tool to get them, then use createFile three times to write each one to disk.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────
//  SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const system_prompt = `
You are a conversational CLI agent that reasons and acts in a ReAct loop:
START -> THINK -> TOOL -> OBSERVE -> (repeat TOOL/OBSERVE as needed) -> OUTPUT.

Available tools:
- getTheWeatherOfCity(cityname)        — fetch live weather
- getGithubDetailsAboutUser(username)  — GitHub public profile
- executeCommand(cmd)                  — run a shell command
- createFile(filepath, content)        — write a file to disk
- fetchWebsiteText(url)                — scrape a URL's text structure
- getScalerFiles()                     — get the COMPLETE Scaler Academy clone files (HTML + CSS + JS)

CRITICAL RULES — follow these exactly:

1. SCALER CLONING WORKFLOW (when user asks to clone or recreate Scaler Academy):
   a. THINK: "I need to clone the Scaler website. I should first scrape it for real data."
   b. TOOL:  fetchWebsiteText("https://www.scaler.com")
   c. OBSERVE the real scraped data (title, headings, bodyText, links).
   d. THINK: "Now I have the real page data. I will use getScalerFiles() to get the reference implementation."
   e. TOOL:  getScalerFiles()
   f. OBSERVE: you get back an object with keys "public/scaler/index.html", "public/scaler/styles.css", "public/scaler/script.js"
   g. TOOL:  createFile("public/scaler/index.html", <the html value from step f>)
   h. OBSERVE result, then continue.
   i. TOOL:  createFile("public/scaler/styles.css", <the css value from step f>)
   j. OBSERVE result, then continue.
   k. TOOL:  createFile("public/scaler/script.js", <the js value from step f>)
   l. OBSERVE result.
   m. OUTPUT: Confirm the three files were written and tell the user to open public/scaler/index.html in their browser.

2. NEVER skip the fetchWebsiteText step — it proves your agent scraped the real site.
3. NEVER try to write the HTML/CSS/JS yourself — always use getScalerFiles() to get the content.
4. NEVER claim success before all three createFile OBSERVE steps confirm { ok: true }.
5. Do ONE tool call per step. Wait for OBSERVE before the next TOOL.
6. For non-Scaler tasks, reason normally and use whichever tools fit.
`.trim();

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function stripMarkdownFences(text) {
  if (typeof text !== "string") return "";
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
}

function tryParseJsonLoose(text) {
  const cleaned = stripMarkdownFences(text);
  if (!cleaned) return { ok: false };
  try { return { ok: true, value: JSON.parse(cleaned) }; } catch {}
  const fb = cleaned.indexOf("{");
  const lb = cleaned.lastIndexOf("}");
  if (fb >= 0 && lb > fb) {
    try { return { ok: true, value: JSON.parse(cleaned.slice(fb, lb + 1)) }; } catch {}
  }
  return { ok: false };
}

async function runToolCall(toolCall) {
  const name    = toolCall.function?.name;
  const rawArgs = toolCall.function?.arguments ?? "{}";
  const parsed  = tryParseJsonLoose(rawArgs);
  const args    = parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : {};

  const fn = tool_map[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);

  // For createFile, only log a short preview of the content to keep terminal clean
  if (name === "createFile") {
    const preview = String(args.content || "").slice(0, 80).replace(/\n/g, " ");
    console.log(`\nTOOL: createFile => ${args.filepath} [${Buffer.byteLength(String(args.content||""),"utf8")} bytes] "${preview}..."`);
  } else {
    console.log(`\nTOOL: ${name}`);
    console.log(`TOOL_INPUT: ${stripMarkdownFences(rawArgs).slice(0, 500)}`);
  }

  let result;
  if (name === "getTheWeatherOfCity")     result = await fn(args.cityname);
  else if (name === "getGithubDetailsAboutUser") result = await fn(args.username);
  else if (name === "executeCommand")      result = await fn(args.cmd);
  else if (name === "createFile")          result = await fn(args.filepath, args.content);
  else if (name === "fetchWebsiteText")    result = await fn(args.url);
  else if (name === "getScalerFiles")      result = await fn();
  else                                     result = await fn(args);

  // For getScalerFiles, show a summary rather than 30KB of HTML
  if (name === "getScalerFiles") {
    const fileKeys = Object.keys(result.files || {});
    console.log(`OBSERVE: getScalerFiles returned ${fileKeys.length} files: ${fileKeys.join(", ")}`);
  } else {
    console.log(`OBSERVE: ${JSON.stringify(result).slice(0, 2000)}`);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
//  REACT LOOP
// ─────────────────────────────────────────────────────────────
async function reactTurn(client, messages) {
  console.log("\nSTART");

  for (let i = 0; i < 20; i++) {
    console.log("\nTHINK");

    const resp = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.1,
    });

    const msg = resp.choices?.[0]?.message;
    if (!msg) return "No response from model.";

    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      messages.push({
        role: "assistant",
        content: msg.content ?? "",
        tool_calls: msg.tool_calls,
      });

      for (const tc of msg.tool_calls) {
        let toolResult;
        try {
          toolResult = await runToolCall(tc);
        } catch (e) {
          toolResult = { ok: false, error: e?.message || String(e) };
          console.log(`OBSERVE: ${JSON.stringify(toolResult).slice(0, 2000)}`);
        }

        // For getScalerFiles, send a compact summary to the model (not 30KB of HTML)
        const toolContent =
          tc.function?.name === "getScalerFiles"
            ? JSON.stringify({
                ok: toolResult.ok,
                description: toolResult.description,
                files: Object.fromEntries(
                  Object.entries(toolResult.files || {}).map(([k, v]) => [
                    k,
                    v, // send the full content so model can pass it to createFile
                  ])
                ),
              })
            : JSON.stringify(toolResult);

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: toolContent,
        });
      }

      continue;
    }

    // No tool calls → final OUTPUT
    const finalText = (msg.content ?? "").trim();
    messages.push({ role: "assistant", content: finalText });
    console.log("\nOUTPUT");
    return finalText || "(empty response)";
  }

  console.log("\nOUTPUT");
  return "Reached max internal steps. Ask me to continue if needed.";
}

// ─────────────────────────────────────────────────────────────
//  MAIN — CLI loop
// ─────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY in .env file.");
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [{ role: "system", content: system_prompt }];

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║        Scaler Website Cloner — CLI Agent         ║");
  console.log("║  Type: clone the scaler website                  ║");
  console.log("║  Or ask anything. Type 'exit' to quit.           ║");
  console.log("╚══════════════════════════════════════════════════╝");

  const ask = () => new Promise((resolve) => rl.question("\nYou> ", resolve));

  while (true) {
    const userInput = String(await ask()).trim();
    if (!userInput) continue;
    if (userInput.toLowerCase() === "exit") {
      console.log("Bye!");
      break;
    }

    messages.push({ role: "user", content: userInput });
    const out = await reactTurn(client, messages);
    console.log("\n" + out);
  }

  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});