// Content script for LinkedIn Connection Auto-Increase extension

let isConnecting = false;
let connectingInterval = null;

function findConnectButtons() {
  // Get all buttons on the page
  const allButtons = Array.from(document.querySelectorAll('button'));
  
  // Filter to only buttons that contain "Connect" text or have Invite aria-label
  const connectButtons = allButtons.filter(button => {
    const text = (button.textContent || button.innerText || '').trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').trim();
    
    // Check if it's a Connect button
    const isConnectButton = (
      text === 'Connect' || 
      text.startsWith('Connect') ||
      ariaLabel.includes('Invite') || 
      ariaLabel.includes('Connect')
    );
    
    // Exclude already connected or pending buttons
    const isNotConnected = (
      !text.includes('Following') && 
      !text.includes('Pending') &&
      !text.includes('Message') &&
      !ariaLabel.includes('Pending')
    );
    
    return isConnectButton && isNotConnected && !button.disabled;
  });
  
  console.log(`Found ${connectButtons.length} connect buttons from ${allButtons.length} total buttons`);
  
  return connectButtons;
}

function startConnecting(delay) {
  console.log("Starting to connect with delay:", delay);
  isConnecting = true;

  const connectButtons = findConnectButtons();
  
  if (connectButtons.length === 0) {
    console.log("No connect buttons found on this page.");
    alert("No Connect buttons found on this page. Make sure you're on the My Network page.");
    return;
  }

  let index = 0;

  connectingInterval = setInterval(() => {
    if (index >= connectButtons.length) {
      console.log("All connect buttons clicked.");
      alert(`Finished! Sent ${index} connection requests.`);
      stopConnecting();
      return;
    }

    const button = connectButtons[index];
    
    // Check if the button is visible and enabled
    if (button.offsetWidth > 0 && button.offsetHeight > 0 && !button.disabled) {
      // Scroll button into view
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        try {
          // Click the button after a slight delay to simulate human interaction
          setTimeout(() => {
            button.click();
            console.log(`Clicked connect button ${index + 1} of ${connectButtons.length}`);
          }, 200); // Additional delay for human-like interaction
            
          index++;
        } catch (e) {
          console.error(`Error clicking button ${index + 1}:`, e);
        }
      }, delay);
    } else {
      console.log(`Button ${index + 1} not visible or disabled, skipping.`);
    }

    // Add a small delay before processing the next button
    setTimeout(() => {
      connectingInterval = setInterval(() => {
        startConnecting(delay);
      }, 100); // Small delay to allow the page to respond
    }, 500);

  }, delay);
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
