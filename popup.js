document.addEventListener('DOMContentLoaded', () => {
  const delayInput = document.getElementById('delayInput');
  const startButton = document.getElementById('startButton');
  const testButton = document.getElementById('testButton');
  const statusDiv = document.getElementById('status');

  startButton.addEventListener('click', async () => {
    const delay = parseInt(delayInput.value, 10);

    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: startFollowing,
      args: [delay]
    });
    
    statusDiv.textContent = 'Started! Check the page...';
  });

  testButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: testFindButtons
    });
    
    statusDiv.textContent = 'Testing... Check console (F12)';
  });
});

function startFollowing(delay) {
  // This function will be injected into the page
  console.log("Starting to follow with delay:", delay);
  
  // Send message to content script
  window.postMessage({ type: 'START_FOLLOWING', delay: delay }, '*');
}

function testFindButtons() {
  // Test function to find and log all potential Connect buttons
  console.log("=== Testing Button Detection ===");
  
  const allButtons = document.querySelectorAll('button');
  console.log(`Total buttons on page: ${allButtons.length}`);
  
  const connectButtons = Array.from(allButtons).filter(button => {
    const text = button.textContent || button.innerText || '';
    const ariaLabel = button.getAttribute('aria-label') || '';
    return text.includes('Connect') || ariaLabel.includes('Invite') || ariaLabel.includes('Connect');
  });
  
  console.log(`Connect buttons found: ${connectButtons.length}`);
  connectButtons.forEach((btn, i) => {
    console.log(`Button ${i + 1}:`, {
      text: btn.textContent.trim(),
      ariaLabel: btn.getAttribute('aria-label'),
      classes: btn.className
    });
  });
  
  alert(`Found ${connectButtons.length} Connect buttons. Check console (F12) for details.`);
}
