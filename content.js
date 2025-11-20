// Content script for LinkedIn Connection Auto-Increase extension

let isConnecting = false;
let connectionDelay = 5000;
let totalToSend = 0;
let sentCount = 0;
let processingTimeout = null;

// Enhanced button detection
function findConnectButtons() {
  // Look for buttons with specific text or aria-labels
  const buttons = Array.from(document.querySelectorAll('button'));
  
  return buttons.filter(button => {
    const text = (button.textContent || '').trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').trim();
    
    // Check for "Connect" text
    const hasConnectText = text === 'Connect';
    
    // Check for "Invite [Name] to connect" or similar in aria-label
    const hasConnectAria = ariaLabel.includes('Invite') && ariaLabel.includes('connect');
    
    // Exclude "Pending" or "Withdraw" buttons just in case
    const isPending = text === 'Pending' || text === 'Withdraw';
    
    return (hasConnectText || hasConnectAria) && !isPending && !button.disabled;
  });
}

function simulateClick(button) {
  if (button && !button.disabled) {
    button.click();
    console.log('Clicked connection button');
    return true;
  }
  return false;
}

function processNextButton() {
  if (!isConnecting) return;

  if (sentCount >= totalToSend) {
    console.log("Reached target connection count.");
    stopConnecting();
    alert(`Finished! Sent ${sentCount} connection requests.`);
    return;
  }

  const buttons = findConnectButtons();
  
  // We always take the first available button because the list might change 
  // (e.g. buttons disappear after clicking)
  if (buttons.length > 0) {
    const button = buttons[0];
    const success = simulateClick(button);
    
    if (success) {
      sentCount++;
      // Send progress update to popup
      chrome.runtime.sendMessage({
        type: 'UPDATE_STATUS',
        sent: sentCount,
        total: totalToSend
      }).catch(() => {
        // Popup might be closed, ignore error
      });
    }
    
    // Schedule next click
    const randomVariation = Math.floor(Math.random() * 1000); // Add up to 1s random variation
    const nextDelay = connectionDelay + randomVariation;
    
    console.log(`Next request in ${nextDelay}ms. Progress: ${sentCount}/${totalToSend}`);
    processingTimeout = setTimeout(processNextButton, nextDelay);
    
  } else {
    console.log("No 'Connect' buttons found. Scrolling and retrying...");
    window.scrollBy(0, 500);
    
    // Retry after a short delay to allow content to load
    processingTimeout = setTimeout(processNextButton, 2000);
  }
}

function startConnecting(delay, count) {
  if (isConnecting) return;
  
  isConnecting = true;
  connectionDelay = Math.max(1000, Number(delay) || 5000);
  totalToSend = Math.min(Number(count) || 30, 100); // Cap at 100 for safety
  sentCount = 0;
  
  console.log(`Starting: Delay=${connectionDelay}ms, Target=${totalToSend}`);
  processNextButton();
}

function stopConnecting() {
  isConnecting = false;
  if (processingTimeout) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
  console.log("Stopped connecting.");
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_FOLLOWING') {
    startConnecting(request.delay, request.count);
    sendResponse({ success: true, message: 'Started' });
  } else if (request.type === 'STOP_FOLLOWING') {
    stopConnecting();
    sendResponse({ success: true, message: 'Stopped' });
  } else if (request.type === 'GET_STATUS') {
    sendResponse({ 
      isConnecting: isConnecting,
      sent: sentCount,
      total: totalToSend
    });
  }
});

console.log("LinkedIn Connection Auto-Increase content script loaded (v2.7).");
