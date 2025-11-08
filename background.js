// Background service worker for the LinkedIn Follower Auto-Increase extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Connection Auto-Increase extension installed.");
  
  // Set default settings
  chrome.storage.sync.set({
    delay: 5000
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['delay'], (result) => {
      sendResponse({ delay: result.delay || 5000 });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({
      delay: request.delay
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log("LinkedIn Connection Auto-Increase background service worker loaded.");
