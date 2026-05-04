# Lumina AI Page Summarizer 🌟

Lumina is a premium, secure, and visually stunning Chrome Extension that instantly extracts meaningful content from any webpage and leverages state-of-the-art AI to generate concise, readable summaries.

## 🚀 Features
- **Provider Agnostic**: Seamlessly swap between Google Gemini and OpenAI.
- **Privacy First**: API keys are stored securely in `chrome.storage.local` and never leave your machine.
- **Intelligent Extraction**: Heuristic extraction precisely strips away ads, navbars, and sidebar clutter, leaving only the main article content.
- **Lightning Fast**: Built on Vanilla JavaScript with zero bloat. Summaries are automatically cached so revisiting a page yields instant results without redundant API calls.
- **Premium UX**: Smooth animations, glassmorphism UI, loading states, and keyboard accessibility.

---

## 🛠️ Installation Instructions

Since this is a local extension, follow these steps to install it directly into Chrome:

1. **Clone/Download the Repository**
2. **Open Chrome Extensions Page:**
   Navigate to `chrome://extensions/` in your Chrome browser.
3. **Enable Developer Mode:**
   Toggle the "Developer mode" switch in the top right corner.
4. **Load Unpacked Extension:**
   Click the "Load unpacked" button in the top left. Select the `AI-Page-Summarizer-HNG-Stage-5` directory on your machine.
5. **Pin the Extension:**
   Click the puzzle piece icon in the Chrome toolbar and pin Lumina for easy access!

---

## ⚙️ Setup & Configuration

Before summarizing your first page, configure your AI provider:
1. Click the Lumina icon in your toolbar.
2. Click the **Gear icon** in the top right of the popup to open the Options page.
3. Select your preferred provider (Google Gemini or OpenAI).
4. Enter your secure API Key and hit **Save Settings**.

---

## 🏗️ Architecture & Technical Decisions

The extension strictly follows Manifest V3 standards:

- **Background Service Worker (`background.js`)**: Acts as a secure orchestrator. It listens for messages, checks the local cache (`storage.js`), securely accesses your API key, and communicates with the AI Provider (`api.js`).
- **Content Script (`content.js`)**: Injected on demand via the Manifest V3 `scripting` API. It uses heuristic filtering to parse the DOM, extracting paragraph text from the most content-dense elements while aggressively filtering out common layout clutter.
- **Popup UI (`popup.html/css/js`)**: A fully responsive, modern interface handling user interactions and dynamically rendering states (Loading, Error, Result).

### AI Integration (`api.js`)
The `summarizeContent` function is written to be entirely **Provider Agnostic**. It accepts `(provider, apiKey, content)` and normalizes the prompt. It then dynamically calls either `callGemini` or `callOpenAI`. The responses from these APIs are enforced to return a structured JSON string, which is parsed into `summary`, `keyInsights`, and `readingTime`.

### Security Decisions
- **No Hardcoded Keys**: Keys are strictly user-provided.
- **Zero API Keys in DOM**: The content script only extracts text. It never sees or touches the API keys. Only the background worker, which is isolated from the webpage, accesses the API key.
- **Data Privacy**: No tracking, no external server relays. Data goes from the webpage, to your browser extension, directly to the AI provider.

### Trade-offs
- **Heuristic Extraction vs. Readability.js**: Instead of vendoring the 10,000-line Mozilla Readability library, a lightweight custom heuristic function was written. While Readability is slightly more robust for edge cases, the heuristic approach drastically reduces the extension payload and ensures no external script dependencies are needed.

---
*Built with ❤️ for Stage 4A*
