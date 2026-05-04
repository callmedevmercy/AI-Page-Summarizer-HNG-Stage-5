import { summarizeContent } from "../utils/api.js";
import { getSettings, getCachedSummary, cacheSummary } from "../utils/storage.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SUMMARIZE_PAGE") {
    handleSummarizeRequest(request.url, request.content)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
      
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

async function handleSummarizeRequest(url, content) {
  // 1. Check cache first
  const cached = await getCachedSummary(url);
  if (cached) {
    return { success: true, data: cached, cached: true };
  }

  // 2. Retrieve user settings (API key and Provider)
  const settings = await getSettings();
  if (!settings.apiKey) {
    throw new Error("Missing API Key. Please click the gear icon to configure it.");
  }

  // 3. Make the API call
  const summaryData = await summarizeContent(settings.provider, settings.apiKey, content);

  // 4. Cache the result for future use
  await cacheSummary(url, summaryData);

  return { success: true, data: summaryData, cached: false };
}
