// Content script for LinkedIn Connection Auto-Increase extension

let isConnecting = false;
let connectingInterval = null;

function findConnectButtons() {
  // Get all span elements with the specific button text "Connect"
  const allSpans = Array.from(document.querySelectorAll('span'));
  return allSpans.filter(span => span.textContent.trim() === 'Connect');
}

function simulateClick(button) {
  if (button.offsetWidth > 0 && button.offsetHeight > 0 && !button.disabled) {
    // Create a mouse event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });

    // Dispatch the click event
    button.dispatchEvent(clickEvent);
    console.log(`Simulated click on connect button ${index + 1} of ${connectButtons.length}`);
  } else {
    console.log(`Button ${index + 1} not visible or disabled, skipping.`);
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
        const buttons = findConnectButtons();
        if (buttons.length > 0) {
          processButtons(buttons);
        }
      }
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(targetNode, observerOptions);
}

function processButtons(buttons) {
  let index = 0;
  function clickNextButton() {
    if (index >= buttons.length) {
      console.log("All connect buttons clicked.");
      alert(`Finished! Sent ${buttons.length} connection requests.`);
      stopConnecting();
      return;
    }

    const button = buttons[index];
    simulateClick(button);
    index++;
    
    // Schedule the next button click after a slight delay
    setTimeout(clickNextButton, 100); // Small delay to allow the page to respond
  }

  clickNextButton();
}

function startConnecting(delay) {
  isConnecting = true;
  console.log('Starting to follow with delay:', delay);
  
  const targetNode = document.body; // Start observing from the body
  observeDOM(targetNode);

  setTimeout(processButtons, delay); // Initial processing after the initial delay
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
    startConnecting(delay);
  } else if (event.data.type === 'STOP_FOLLOWING') {
    stopConnecting();
  }
});

console.log("LinkedIn Connection Auto-Increase content script loaded.");
