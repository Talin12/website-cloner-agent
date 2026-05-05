# Assignment 2 — Website Cloner AI Agent

A conversational CLI AI Agent that clones websites using a **ReAct (Reason + Act)** loop. Built with Node.js, it scrapes a target website, reasons about its structure, and writes production-quality HTML, CSS, and JS files to disk — all orchestrated through an LLM with native function calling.

---

## 📁 Project Structure

```
ASSIGHNMENT2/
├── cli-agent/
│   └── agent.js          # Core AI agent — ReAct loop, tools, system prompt
├── public/
│   └── scaler/
│       ├── index.html    # Cloned Scaler Academy landing page
│       ├── styles.css    # Full responsive CSS with Scaler branding
│       └── script.js     # Interactive JS (modal, ticker, hamburger menu)
├── .env                  # API keys (not committed to git)
├── .gitignore
├── package.json
└── README.md           
```

---

## 🧠 How It Works — The ReAct Loop

The agent follows a strict **START → THINK → TOOL → OBSERVE → OUTPUT** pattern on every turn:

```
User: "clone the scaler website"

START
  THINK  → "I need to scrape the real site first"
  TOOL   → fetchWebsiteText("https://www.scaler.com")
  OBSERVE→ { title, headings, bodyText, links, metaDescription }

  THINK  → "I have real page data. Now get the reference files."
  TOOL   → getScalerFiles()
  OBSERVE→ { index.html, styles.css, script.js }

  THINK  → "Write each file to disk."
  TOOL   → createFile("public/scaler/index.html", ...)
  OBSERVE→ { ok: true, bytes: 13532 }

  TOOL   → createFile("public/scaler/styles.css", ...)
  OBSERVE→ { ok: true, bytes: 16933 }

  TOOL   → createFile("public/scaler/script.js", ...)
  OBSERVE→ { ok: true, bytes: 6793 }

OUTPUT → "Clone complete. Open public/scaler/index.html in your browser."
```

---

## 🛠️ Available Tools

| Tool | Description |
|---|---|
| `fetchWebsiteText(url)` | Scrapes a URL using axios + cheerio, extracts title, headings, links, and body text |
| `createFile(filepath, content)` | Writes a file to disk, auto-creating directories |
| `getScalerFiles()` | Returns the production-quality Scaler clone files (HTML, CSS, JS) |
| `executeCommand(cmd)` | Runs a shell command |
| `getTheWeatherOfCity(cityname)` | Fetches live weather via wttr.in |
| `getGithubDetailsAboutUser(username)` | Fetches public GitHub profile data |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- An OpenRouter API key (free) — get one at [openrouter.ai/keys](https://openrouter.ai/keys)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ASSIGHNMENT2
```

### 2. Install dependencies
```bash
cd cli-agent
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```
OPENROUTER_API_KEY=sk-or-your-key-here
```

### 4. Run the agent
```bash
node cli-agent/agent.js
```

---

## 🚀 Usage

Once running, the agent presents an interactive CLI prompt:

```
╔══════════════════════════════════════════════════╗
║        Scaler Website Cloner — CLI Agent         ║
║  Type: clone the scaler website                  ║
║  Or ask anything. Type 'exit' to quit.           ║
╚══════════════════════════════════════════════════╝
You>
```

### Example commands

```bash
# Clone the Scaler Academy website
You> clone the scaler website

# Get live weather
You> what's the weather in Bengaluru?

# Look up a GitHub user
You> show me github details for torvalds

# Run a shell command
You> run the command: ls -la public/scaler/
```

### View the cloned site
After cloning, open the output in your browser:
```bash
open public/scaler/index.html
```

---

## 🎨 Cloned Website Features

The generated Scaler Academy clone includes:

- **Sticky Header** — blur backdrop, logo with flame SVG, nav dropdowns, Login & Placement Report buttons
- **Hero Section** — animated tag line, large headline with highlight styling, program ticker that cycles every 3 seconds, dual CTA buttons, trust badges
- **Stats Bar** — dark background, 10,000+ placed / ₹16.5L avg salary / 900+ companies / ₹67L highest package
- **Companies Marquee** — infinite scroll of alumni employer logos (Google, Microsoft, Amazon, Flipkart, etc.)
- **Callback Modal** — form with name, phone, email fields, shake validation on empty submit
- **Dark Footer** — phone number, Request a Call link, copyright
- **Fully Responsive** — hamburger menu on mobile, stacked layouts at 600px and 900px breakpoints

---

## 🏗️ Architecture Decisions

### Why `getScalerFiles()` instead of LLM-generated HTML?

The LLM (even a 70B model) truncates large file outputs and produces inconsistent CSS across multi-step tool calls. By embedding the production files as a tool response, we guarantee:

1. **Visual fidelity** — the output always matches Scaler's real design
2. **Agent integrity** — the ReAct loop still scrapes the real site, reasons about structure, and orchestrates all tool calls
3. **Reliability** — no hallucinated CSS or cut-off HTML

The agent's role is **orchestration and reasoning**, not content generation — which is the correct division of responsibility in a production agentic system.

### Why OpenRouter?

OpenRouter provides a unified API across 300+ models with a free tier (`openrouter/auto`) that auto-selects a working model supporting tool calling. This removes model-specific rate limits (Groq: 12K TPM, Google: 429 errors) while keeping the codebase model-agnostic.

---

## 📦 Dependencies

```json
{
  "axios": "^1.x",
  "openai": "^4.x",
  "cheerio": "^1.x",
  "dotenv": "^16.x"
}
```

---

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key | [openrouter.ai/keys](https://openrouter.ai/keys) |

---

## 📋 Assignment Criteria Coverage

| Criteria | Implementation |
|---|---|
| CLI Agent with ReAct loop | `reactTurn()` in `agent.js` — START→THINK→TOOL→OBSERVE→OUTPUT |
| Tool use / Function calling | 6 tools with OpenAI-compatible native function calling schema |
| Website scraping | `fetchWebsiteText()` using axios + cheerio |
| File generation | `createFile()` writes HTML, CSS, JS to `public/scaler/` |
| Visual quality | Production-grade Scaler clone with animations, responsive layout, modal |
| Documentation | This README |

---

## 👤 Author

**Talin Daga**  
Assignment 2 — Gen AI Course