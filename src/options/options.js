import { getSettings, saveSettings } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settings-form');
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const statusMessage = document.getElementById('status-message');

  // Load existing settings
  const settings = await getSettings();
  if (settings.provider) {
    providerSelect.value = settings.provider;
  }
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key.', 'error');
      return;
    }

    try {
      await saveSettings(provider, apiKey);
      showStatus('Settings saved successfully!', 'success');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        statusMessage.classList.add('hidden');
      }, 3000);
    } catch (error) {
      showStatus('Failed to save settings.', 'error');
    }
  });

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.classList.remove('hidden');
  }
});
