document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    settingsBtn: document.getElementById('settings-btn'),
    summarizeBtn: document.getElementById('summarize-btn'),
    retryBtn: document.getElementById('retry-btn'),
    copyBtn: document.getElementById('copy-btn'),
    resetBtn: document.getElementById('reset-btn'),
    
    pageTitle: document.getElementById('page-title'),
    
    states: {
      initial: document.getElementById('initial-state'),
      loading: document.getElementById('loading-state'),
      error: document.getElementById('error-state'),
      result: document.getElementById('result-state')
    },
    
    errorMsg: document.getElementById('error-message'),
    
    result: {
      readTime: document.getElementById('read-time'),
      summary: document.getElementById('summary-text'),
      keyInsights: document.getElementById('key-insights-list')
    }
  };

  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.title) {
    elements.pageTitle.textContent = tab.title;
  }

  function switchState(stateName) {
    Object.values(elements.states).forEach(el => el.classList.remove('active'));
    elements.states[stateName].classList.add('active');
  }

  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  async function handleSummarize() {
    switchState('loading');
    
    try {
      // 1. Inject content script if not already injected (MV3 scripting API)
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content/content.js']
      });

      // 2. Request content extraction from the content script
      const extraction = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_CONTENT" }, response => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      });

      if (!extraction || !extraction.success) {
        throw new Error(extraction?.error || "Could not extract page content.");
      }

      // 3. Send content to background script for summarization
      const summaryResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ 
          action: "SUMMARIZE_PAGE", 
          url: tab.url,
          content: extraction.content 
        }, response => {
          resolve(response);
        });
      });

      if (summaryResponse.error) {
        throw new Error(summaryResponse.error);
      }

      // 4. Render results
      renderResults(summaryResponse.data);

    } catch (error) {
      elements.errorMsg.textContent = error.message || "An unexpected error occurred.";
      switchState('error');
    }
  }

  function renderResults(data) {
    elements.result.readTime.textContent = data.readingTime || "Unknown reading time";
    elements.result.summary.textContent = data.summary;
    
    // Render key insights
    elements.result.keyInsights.innerHTML = '';
    if (data.keyInsights && Array.isArray(data.keyInsights)) {
      data.keyInsights.forEach(insight => {
        const li = document.createElement('li');
        li.textContent = insight;
        elements.result.keyInsights.appendChild(li);
      });
    }

    switchState('result');
  }

  elements.summarizeBtn.addEventListener('click', handleSummarize);
  elements.retryBtn.addEventListener('click', handleSummarize);
  
  elements.resetBtn.addEventListener('click', () => {
    switchState('initial');
  });

  elements.copyBtn.addEventListener('click', async () => {
    const textToCopy = `Summary:\n${elements.result.summary.textContent}\n\nKey Insights:\n${Array.from(elements.result.keyInsights.children).map(li => '- ' + li.textContent).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Temporary icon change to show success
      const originalSvg = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      
      setTimeout(() => {
        elements.copyBtn.innerHTML = originalSvg;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  });
});
