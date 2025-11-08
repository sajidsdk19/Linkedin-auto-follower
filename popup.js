document.addEventListener('DOMContentLoaded', () => {
  const delayInput = document.getElementById('delayInput');
  const maxConnectionsInput = document.getElementById('maxConnections');
  const startButton = document.getElementById('startButton');
  const testButton = document.getElementById('testButton');
  const statusDiv = document.getElementById('status');

  startButton.addEventListener('click', async () => {
    const delay = Math.max(1000, parseInt(delayInput.value, 10) || 5000);
    const maxConnections = Math.min(30, Math.max(1, parseInt(maxConnectionsInput.value, 10) || 10));

    // Update inputs to show validated values
    delayInput.value = delay;
    maxConnectionsInput.value = maxConnections;

    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: startFollowing,
        args: [delay, maxConnections]
      });
      
      statusDiv.textContent = `Sending up to ${maxConnections} connections...`;
      statusDiv.className = 'status-success';
    } catch (error) {
      console.error('Error starting connection process:', error);
      statusDiv.textContent = 'Error: ' + (error.message || 'Failed to start');
      statusDiv.className = 'status-error';
    }
  });

  testButton.addEventListener('click', async () => {
    statusDiv.textContent = 'Testing... Check console (F12)';
    statusDiv.className = 'status-info';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: testFindButtons
      });
    } catch (error) {
      console.error('Error testing buttons:', error);
      statusDiv.textContent = 'Error: ' + (error.message || 'Failed to test buttons');
      statusDiv.className = 'status-error';
    }
  });
});

function startFollowing(delay, maxConnections) {
  // This function will be injected into the page
  console.log("Starting to follow with delay:", delay, "max connections:", maxConnections);
  
  // Send message to content script
  window.postMessage({ 
    type: 'START_FOLLOWING', 
    delay: delay,
    count: maxConnections
  }, '*');
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
