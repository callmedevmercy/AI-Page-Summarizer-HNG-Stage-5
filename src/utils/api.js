/**
 * api.js
 * Provider-agnostic API utility for AI calls.
 */

const SYSTEM_PROMPT = `You are a highly efficient assistant. Summarize the provided webpage content.
Return the summary in the following structured JSON format:
{
  "summary": "A 2-3 sentence overview of the page.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3", ...],
  "readingTime": "X min read"
}
Only return valid JSON, no markdown blocks.`;

/**
 * Calls the AI provider to summarize content.
 * @param {string} provider - 'gemini' or 'openai'
 * @param {string} apiKey - The API key for the provider
 * @param {string} content - The extracted webpage content
 * @returns {Promise<Object>} - A parsed JSON object with summary, keyInsights, and readingTime
 */
export async function summarizeContent(provider, apiKey, content) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in the Options page.");
  }

  if (!content || content.trim() === "") {
    throw new Error("No readable content found on this page.");
  }

  const prompt = `Content:\n\n${content.substring(0, 30000)}`; // Basic truncation to avoid token limits

  try {
    if (provider === "gemini") {
      return await callGemini(apiKey, prompt);
    } else if (provider === "openai") {
      return await callOpenAI(apiKey, prompt);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error("API Call Error:", error);
    throw new Error(error.message || "Failed to generate summary.");
  }
}

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        { parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error("Invalid response from Gemini.");
  }

  return JSON.parse(textResponse);
}

async function callOpenAI(apiKey, prompt) {
  const url = "https://api.openai.com/v1/chat/completions";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `OpenAI API Error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.choices?.[0]?.message?.content;

  if (!textResponse) {
    throw new Error("Invalid response from OpenAI.");
  }

  return JSON.parse(textResponse);
}
