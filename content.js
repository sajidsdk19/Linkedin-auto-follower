// Content script for LinkedIn Connection Auto-Increase extension

let isConnecting = false;
let connectingInterval = null;
let isProcessing = false;
let totalToSend = 0; // target number of connections to send in this run (max 30)
let sentCount = 0;   // number of connections sent in this run

function findConnectButtons() {
  // Get all span elements with the specific button text "Connect"
  const allSpans = Array.from(document.querySelectorAll('span'));
  
  if (!allSpans || allSpans.length === 0) {
    console.log("No spans found.");
    return [];
  }

  const connectButtons = allSpans.filter(span => span.textContent.trim() === 'Connect');
  
  if (connectButtons.length === 0) {
    console.log("No 'Connect' buttons found within spans.");
  }
  
  return connectButtons;
}

function simulateClick(button, index, total) {
  if (button.offsetWidth > 0 && button.offsetHeight > 0 && !button.disabled) {
    // Create a mouse event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    // Dispatch the click event
    button.dispatchEvent(clickEvent);
    console.log(`Simulated click on connect button ${index} of ${total}`);
  } else {
    console.log(`Button ${index} not visible or disabled, skipping.`);
  }
}

function observeDOM(targetNode) {
  const observerOptions = {
    childList: true,
    subtree: true
  };

  const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Only (re)process if we're connecting but not already processing
        if (isConnecting && !isProcessing) {
          const buttons = findConnectButtons();
          if (buttons.length > 0) {
            isProcessing = true;
            processButtons(buttons);
          }
        }
      }
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(targetNode, observerOptions);
}

let connectionDelay = 5000; // Default delay if not specified

function processButtons(buttons) {
  let index = 0;
  function clickNextButton() {
    if (sentCount >= totalToSend || index >= buttons.length) {
      console.log("Finished batch.");
      alert(`Finished! Sent ${sentCount} connection requests.`);
      isProcessing = false;
      stopConnecting();
      return;
    }

    const button = buttons[index];
    simulateClick(button, index + 1, buttons.length);
    sentCount++;
    index++;
    
    // Schedule the next button click using the configured delay
    console.log(`Next connection in ${connectionDelay}ms...`);
    setTimeout(clickNextButton, connectionDelay);
  }

  clickNextButton();
}

function startConnecting(delay, count) {
  isConnecting = true;
  isProcessing = false;
  totalToSend = Math.min(Number(count) || 30, 30);
  sentCount = 0;
  connectionDelay = Math.max(1000, Number(delay) || 5000); // Ensure minimum 1s delay
  console.log('Starting to follow with delay:', connectionDelay, 'ms, max connections:', totalToSend);
  
  const targetNode = document.body; // Start observing from the body
  observeDOM(targetNode);

  setTimeout(() => {
    const buttons = findConnectButtons();
    if (buttons && buttons.length > 0) {
      isProcessing = true;
      processButtons(buttons);
    } else {
      console.log("No buttons to process after initial delay.");
    }
  }, delay); // Initial processing after the initial delay
}

function stopConnecting() {
  isConnecting = false;
  if (connectingInterval) {
    clearInterval(connectingInterval);
    connectingInterval = null;
  }
  console.log("Stopped connecting.");
}

// Listen for messages from popup
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'START_FOLLOWING') {
    const delay = event.data.delay || 5000;
    const count = Math.min(Number(event.data.count) || 30, 30);
    startConnecting(delay, count);
  } else if (event.data.type === 'STOP_FOLLOWING') {
    stopConnecting();
  }
});

console.log("LinkedIn Connection Auto-Increase content script loaded.");
