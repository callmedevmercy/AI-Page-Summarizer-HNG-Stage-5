# Lumina: AI Page Summarizer 🌟

> **A premium, secure, and lightning-fast Chrome Extension built on Manifest V3 that extracts meaningful content from any webpage and leverages state-of-the-art AI to generate concise, readable summaries.**

Lumina was built as a Stage 4A project for the Frontend Wizards track. It is designed to be a fully functional, production-ready extension that prioritizes user security, performance, and a stunning "Sky Blue" glassmorphism aesthetic.

---

## 🚀 Key Features

* **Provider Agnostic AI Integration**: Seamlessly swap between Google Gemini and OpenAI. The underlying API architecture automatically formats prompts and parses responses perfectly regardless of the provider you choose.
* **Intelligent Heuristic Extraction**: Automatically strips away ads, navbars, footers, and sidebar clutter. It dynamically identifies the most content-dense elements on the page, extracting only the actual article text you care about.
* **Bulletproof Security**: Your API keys are your business. They are stored strictly locally in `chrome.storage.local` and are completely isolated inside the Background Service Worker. They are *never* exposed to the webpage DOM or the Popup UI.
* **Lightning Fast Caching**: Summaries are automatically hashed by URL and cached. If you close the popup and reopen it on the same page, your summary appears instantly—saving you time and preventing redundant AI API charges.
* **Premium UX & Design**: Built with a custom, vibrant Sky Blue theme featuring glassmorphism, fluid CSS animations, distinct visual states (Loading, Error, Result), and full keyboard accessibility.
* **Robust Edge-Case Handling**: Gracefully handles massive Wikipedia articles (via intelligent token truncation), empty/restricted Chrome pages, missing API keys, and prevents double-click API spamming.

---

## 🛠️ Installation Instructions

Since this is a custom local extension (not hosted on the Chrome Web Store), follow these steps to install it directly into your browser:

1. **Clone or Download the Repository:**
   Save the project folder (`AI-Page-Summarizer-HNG-Stage-5`) to your local machine.
2. **Open the Chrome Extensions Page:**
   Open Google Chrome and navigate to `chrome://extensions/` in your address bar.
3. **Enable Developer Mode:**
   Toggle the "Developer mode" switch located in the top right corner of the page.
4. **Load the Unpacked Extension:**
   Click the "Load unpacked" button in the top left corner. Select the `AI-Page-Summarizer-HNG-Stage-5` directory on your machine.
5. **Pin Lumina:**
   Click the puzzle piece icon in the Chrome toolbar and pin the Lumina icon for easy access!

---

## ⚙️ Setup & Configuration

Before summarizing your first page, you must configure your AI provider:

1. Click the Lumina icon in your Chrome toolbar.
2. Click the **Gear icon** in the top right corner of the popup to open the secure Options page.
3. Select your preferred provider (Google Gemini or OpenAI).
4. Enter your secure API Key. 
   *(Don't have one? There are quick links in the Options page to generate a free key from Google AI Studio or the OpenAI Platform).*
5. Hit **Save Settings**. 

You are now ready to summarize! Navigate to any long-form article or blog post, open the extension, and click **Summarize Page**.

---

## 🏗️ Architecture & Technical Decisions

Lumina strictly adheres to the modern **Manifest V3** standard, utilizing a highly modular Vanilla JavaScript, HTML, and CSS architecture without the bloat of a heavy framework.

### 1. Background Service Worker (`background.js`)
Acts as the secure orchestrator of the extension. It listens for messages from the popup, manages the local cache via `storage.js`, securely retrieves your API key, and communicates with the AI Provider (`api.js`). Because it runs in an isolated background environment, it acts as a perfect security proxy.

### 2. Content Script (`content.js`)
Injected on demand via the Manifest V3 `scripting` API. Rather than vendoring a massive 10,000-line library like Mozilla's Readability.js, Lumina uses a custom, lightweight heuristic filtering algorithm. It parses the DOM, identifies `<article>` or `<main>` tags, and falls back to locating the most paragraph-dense `<div>` while actively excluding elements with classes/IDs related to navigation or advertising.

### 3. Provider Agnostic API (`api.js`)
The `summarizeContent` function acts as a dynamic router. It accepts `(provider, apiKey, content)`, constructs a clean prompt, and routes the network request to either `callGemini` or `callOpenAI`. Both functions enforce strict JSON outputs via system instructions and return a consistent `{ summary, keyInsights, readingTime }` object to the UI.

### 4. Popup UI (`popup.html`, `popup.css`, `popup.js`)
A fully responsive, modern interface handling user interactions. It dynamically switches between explicitly defined DOM states (`initial`, `loading`, `error`, `result`) ensuring a clean, state-driven UI flow. 

---

## 🔒 Security Decisions & Data Privacy

Security was the highest priority when building Lumina:

* **Zero Hardcoded Secrets**: Keys are strictly user-provided.
* **DOM Isolation**: The Content Script (which touches the active webpage) only extracts text. It never sees or touches the API keys. 
* **Network Tab Obfuscation**: The API fetch requests are made entirely within the Background Service Worker. This means if a user (or a malicious script) opens the Network Tab on the active webpage, they will see absolutely nothing. The API key is never transmitted through the webpage context.
* **Local Storage Only**: Your settings and cache are saved using `chrome.storage.local`. Lumina has no backend servers; your data travels straight from your browser to the AI provider.

---

## ⚖️ Trade-offs & Considerations

* **Heuristics vs. Readability.js**: To keep the extension incredibly lightweight and fast, I opted to write a custom heuristic algorithm instead of including external libraries. While Readability.js is exceptional for extreme edge cases, the custom heuristic approach drastically reduces the extension payload size and handles 95% of modern web layouts perfectly.
* **Vanilla JS vs. React/Vite**: I chose Vanilla ES6 Modules over a framework like React. For a Chrome Extension popup that only manages a few discrete states, Vanilla JS ensures zero build-step complexity, a tiny footprint, and incredibly fast cold-start execution times.
* **Token Truncation**: To ensure the extension does not hang on massive pages (like huge Wikipedia entries) and to avoid expensive API token limits, the extracted text is strictly sliced to the first 6,000 characters. This provides the AI with more than enough context to generate accurate summaries while keeping the response time blazingly fast.

---
*Built with ❤️ for HNG Stage 4A, you guys love stressing us tho*
