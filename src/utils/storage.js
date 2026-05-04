/**
 * storage.js
 * Utility wrapper for chrome.storage operations
 */

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["aiProvider", "apiKey"], (result) => {
      resolve({
        provider: result.aiProvider || "gemini",
        apiKey: result.apiKey || ""
      });
    });
  });
}

export async function saveSettings(provider, apiKey) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ aiProvider: provider, apiKey: apiKey }, () => {
      resolve();
    });
  });
}

export async function getCachedSummary(url) {
  return new Promise((resolve) => {
    const key = `summary_${btoa(url).slice(0, 50)}`; // encode url to make a safe key
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

export async function cacheSummary(url, summaryData) {
  return new Promise((resolve) => {
    const key = `summary_${btoa(url).slice(0, 50)}`;
    chrome.storage.local.set({ [key]: summaryData }, () => {
      resolve();
    });
  });
}

export async function clearCache() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const keysToRemove = Object.keys(items).filter(k => k.startsWith("summary_"));
      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, resolve);
      } else {
        resolve();
      }
    });
  });
}
