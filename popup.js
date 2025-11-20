document.addEventListener('DOMContentLoaded', async () => {
  const delayInput = document.getElementById('delayInput');
  const maxConnectionsInput = document.getElementById('maxConnections');
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const openLinkedInBtn = document.getElementById('openLinkedIn');
  const statusArea = document.getElementById('statusArea');
  const statusText = document.getElementById('statusText');
  const progressFill = document.getElementById('progressFill');

  // Load saved settings
  const saved = await chrome.storage.sync.get(['delay', 'maxConnections']);
  if (saved.delay) delayInput.value = saved.delay;
  if (saved.maxConnections) maxConnectionsInput.value = saved.maxConnections;

  // Check current status
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes('linkedin.com')) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' });
      if (response && response.isConnecting) {
        showRunningState(response.sent, response.total);
      }
    } catch (e) {
      // Content script might not be ready or not injected
    }
  }

  startButton.addEventListener('click', async () => {
    const delay = Math.max(1000, parseInt(delayInput.value, 10) || 5000);
    const maxConnections = Math.min(100, Math.max(1, parseInt(maxConnectionsInput.value, 10) || 30));

    // Save settings
    chrome.storage.sync.set({ delay, maxConnections });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com')) {
      statusText.textContent = 'Please go to LinkedIn first';
      statusArea.style.display = 'block';
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'START_FOLLOWING',
        delay,
        count: maxConnections
      });

      showRunningState(0, maxConnections);
    } catch (error) {
      console.error('Error:', error);
      statusText.textContent = 'Refresh the page and try again';
      statusArea.style.display = 'block';
    }
  });

  stopButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'STOP_FOLLOWING' });
      showStoppedState();
    } catch (error) {
      console.error(error);
    }
  });

  openLinkedInBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/mynetwork/' });
  });

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_STATUS') {
      updateProgress(message.sent, message.total);
    }
  });

  function showRunningState(sent, total) {
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
    statusArea.style.display = 'block';
    delayInput.disabled = true;
    maxConnectionsInput.disabled = true;
    updateProgress(sent, total);
  }

  function showStoppedState() {
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
    delayInput.disabled = false;
    maxConnectionsInput.disabled = false;
    statusText.textContent = 'Stopped';
  }

  function updateProgress(sent, total) {
    const percentage = (sent / total) * 100;
    progressFill.style.width = `${percentage}%`;
    statusText.textContent = `Sent ${sent} of ${total} requests`;

    if (sent >= total) {
      showStoppedState();
      statusText.textContent = 'Completed!';
    }
  }
});
