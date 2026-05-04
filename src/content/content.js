/**
 * content.js
 * Extracts text from the webpage using heuristic filtering.
 */

function extractReadableContent() {
  // 1. Try to find semantic tags that contain the main content
  const article = document.querySelector('article');
  if (article) {
    return cleanAndExtractText(article);
  }

  const main = document.querySelector('main');
  if (main) {
    return cleanAndExtractText(main);
  }

  // 2. Heuristic approach: find the div with the most paragraph tags
  const divs = document.querySelectorAll('div');
  let bestDiv = null;
  let maxPCount = 0;

  divs.forEach(div => {
    // Avoid navs, headers, footers, sidebars based on class/id names
    const className = (div.className || "").toString().toLowerCase();
    const id = (div.id || "").toLowerCase();
    
    if (className.includes('nav') || id.includes('nav') ||
        className.includes('footer') || id.includes('footer') ||
        className.includes('sidebar') || id.includes('sidebar') ||
        className.includes('menu') || id.includes('menu')) {
      return; // Skip this div
    }

    const pCount = div.querySelectorAll('p').length;
    if (pCount > maxPCount) {
      maxPCount = pCount;
      bestDiv = div;
    }
  });

  if (bestDiv && maxPCount > 2) {
    return cleanAndExtractText(bestDiv);
  }

  // 3. Fallback: extract everything from the body, minus obvious clutter
  return cleanAndExtractText(document.body);
}

function cleanAndExtractText(element) {
  // Clone to avoid modifying the actual page DOM
  const clone = element.cloneNode(true);

  // Remove unwanted elements
  const selectorsToRemove = [
    'nav', 'footer', 'header', 'aside', 'script', 'style', 'noscript', 'iframe',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.nav', '.navigation', '.menu', '.sidebar', '.footer', '.ad', '.ads', '.advertisement',
    '#nav', '#navigation', '#menu', '#sidebar', '#footer'
  ];

  clone.querySelectorAll(selectorsToRemove.join(',')).forEach(el => el.remove());

  // Extract text and clean up whitespace
  let text = clone.innerText || clone.textContent;
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_CONTENT") {
    try {
      const content = extractReadableContent();
      const title = document.title;
      sendResponse({ success: true, content, title });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});
