require("dotenv/config");

const axios = require("axios");
const { OpenAI } = require("openai");
const { exec } = require("child_process");
const cheerio = require("cheerio");
const fs = require("fs/promises");
const path = require("path");
const readline = require("readline");

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
        reject(
          new Error(
            `Command failed: ${cmd}\n${stderr || stdout || error.message}`
          )
        );
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
  const resolved = path.resolve(process.cwd(), normalized);
  const dir = path.dirname(resolved);
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
  try {
    parsed = new URL(input);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }

  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http(s) URLs are supported.");
  }

  const { data: html } = await axios.get(parsed.toString(), {
    responseType: "text",
    timeout: 20000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
      Accept: "text/html,application/xhtml+xml",
    },
    // Some sites block non-browser clients; this is best-effort.
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const $ = cheerio.load(html);

  $("script,noscript,style,svg,canvas,iframe").remove();
  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || "";

  const headings = [];
  $("h1,h2,h3").each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;
    headings.push({ tag, text });
  });

  const links = [];
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!href) return;
    if (href.startsWith("#")) return;
    links.push({ text: text.slice(0, 80), href: href.slice(0, 200) });
  });

  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  return {
    ok: true,
    url: parsed.toString(),
    title,
    metaDescription,
    headings: headings.slice(0, 60),
    links: links.slice(0, 60),
    bodyText,
  };
}

const tool_map = {
  getTheWeatherOfCity,
  getGithubDetailsAboutUser,
  executeCommand,
  createFile,
  fetchWebsiteText,
};

const tools = [
  {
    type: "function",
    function: {
      name: "getTheWeatherOfCity",
      description: "Get weather summary for a city using wttr.in",
      parameters: {
        type: "object",
        properties: {
          cityname: { type: "string", description: "City name, e.g. Bengaluru" },
        },
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
        properties: {
          username: { type: "string", description: "GitHub username" },
        },
        required: ["username"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executeCommand",
      description:
        "Run a shell command. Use carefully; prefer createFile for generating project files.",
      parameters: {
        type: "object",
        properties: {
          cmd: { type: "string", description: "Command to execute" },
        },
        required: ["cmd"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createFile",
      description:
        "Create/overwrite a file at filepath with provided content. Creates parent directories if missing.",
      parameters: {
        type: "object",
        properties: {
          filepath: {
            type: "string",
            description:
              "Path relative to project root or absolute path (prefer relative), e.g. public/scaler/index.html",
          },
          content: { type: "string", description: "Full file contents" },
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
      description:
        "Fetch a URL's HTML and extract lightweight text structure (title, headings, links, body text snippet).",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The website URL to fetch, e.g. https://www.scaler.com",
          },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
];

const system_prompt = `
You are a conversational CLI agent that uses a ReAct loop:
START -> THINK -> TOOL -> OBSERVE -> (repeat TOOL/OBSERVE as needed) -> OUTPUT.

You have tools available:
- getTheWeatherOfCity(cityname)
- getGithubDetailsAboutUser(username)
- executeCommand(cmd)
- createFile(filepath, content)
- fetchWebsiteText(url)

CRITICAL rules:
- When asked to "clone" a website (e.g. Scaler Academy), you MUST FIRST call fetchWebsiteText(url) for the target site (e.g. https://www.scaler.com).
- You MUST OBSERVE real output from fetchWebsiteText: title, headings, important links, and bodyText snippet.
- THEN THINK about the page layout and design, and only then start generating files.
- You MUST use createFile to actually generate real files for a working webpage (do it over multiple tool calls):
  - At minimum create: index.html, styles.css, script.js
  - The page MUST include: Header, Hero Section, Footer
  - Link the CSS and JS from the HTML so it runs in a browser.
- After each createFile call, wait for OBSERVE (tool result) before claiming success.
- Do NOT finish in a single step. Plan, create files, verify (e.g. by creating multiple files), then OUTPUT.

When producing your final response, clearly tell the user where you wrote the files and how to open them.
`.trim();

function stripMarkdownFences(text) {
  if (typeof text !== "string") return "";
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
}

function tryParseJsonLoose(text) {
  const cleaned = stripMarkdownFences(text);
  if (!cleaned) return { ok: false };

  // Try direct parse first.
  try {
    return { ok: true, value: JSON.parse(cleaned) };
  } catch {}

  // Fallback: grab the first JSON object-ish block.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const slice = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return { ok: true, value: JSON.parse(slice) };
    } catch {}
  }

  return { ok: false };
}

async function runToolCall(toolCall) {
  const name = toolCall.function?.name;
  const rawArgs = toolCall.function?.arguments ?? "{}";
  const parsed = tryParseJsonLoose(rawArgs);
  const args =
    parsed.ok && parsed.value && typeof parsed.value === "object"
      ? parsed.value
      : {};

  const fn = tool_map[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);

  // Print TOOL stage (safe: inputs can be large; keep concise).
  console.log(`\nTOOL: ${name}`);
  console.log(`TOOL_INPUT: ${stripMarkdownFences(rawArgs).slice(0, 2000)}`);

  let result;
  if (name === "getTheWeatherOfCity") {
    result = await fn(args.cityname);
  } else if (name === "getGithubDetailsAboutUser") {
    result = await fn(args.username);
  } else if (name === "executeCommand") {
    result = await fn(args.cmd);
  } else if (name === "createFile") {
    result = await fn(args.filepath, args.content);
  } else if (name === "fetchWebsiteText") {
    result = await fn(args.url);
  } else {
    result = await fn(args);
  }
  console.log(`OBSERVE: ${JSON.stringify(result).slice(0, 4000)}`);
  return result;
}

async function reactTurn(client, messages) {
  console.log("\nSTART");

  for (let i = 0; i < 12; i++) {
    console.log("\nTHINK");

    const resp = await client.chat.completions.create({
      model: 'llama3-70b-8192',
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    });

    const msg = resp.choices?.[0]?.message;
    if (!msg) return "No response from model.";

    // If model used function calling, execute tools.
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
          console.log(`OBSERVE: ${JSON.stringify(toolResult).slice(0, 4000)}`);
        }

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        });
      }

      continue;
    }

    // No tool calls: treat as final OUTPUT.
    const finalText = (msg.content ?? "").trim();
    messages.push({ role: "assistant", content: finalText });
    console.log("\nOUTPUT");
    return finalText || "(empty response)";
  }

  console.log("\nOUTPUT");
  return "I hit the max internal steps for this turn. Please refine your request or ask me to continue.";
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "Missing OPENAI_API_KEY. Set it in your environment or a .env file at project root."
    );
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [{ role: "system", content: system_prompt }];

  console.log("Conversational CLI Agent ready. Type your message (or 'exit').");

  const ask = () =>
    new Promise((resolve) => rl.question("\nYou> ", resolve));

  while (true) {
    const userInput = String(await ask()).trim();
    if (!userInput) continue;
    if (userInput.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: userInput });
    const out = await reactTurn(client, messages);
    console.log(out);
  }

  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

