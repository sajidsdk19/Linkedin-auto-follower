# LinkedIn Connection Auto-Increase Extension

> Developed by **Sajid Khan**  (https://sajidkhan.me){:target="_blank"}
> CTO at [**TechScape**](https://solutions.techsape.pk){:target="_blank"}

A Chrome extension that automates sending LinkedIn connection requests with customizable delays between requests.

## Features

- **Automated Connection Requests**: Automatically sends connection requests on LinkedIn
- **Customizable Delay**: Set your preferred delay between connection requests (minimum 1 second)
- **Connection Limit**: Set a maximum number of connections to send (up to 30 at a time)
- **Smart Button Detection**: Intelligently finds and clicks "Connect" buttons
- **Safe & Respectful**: Built with rate limiting to avoid triggering LinkedIn's security
- **One-Click LinkedIn Access**: Quick access to LinkedIn's connection page

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension directory
5. Pin the extension to your toolbar for easy access

## How to Use

1. Navigate to LinkedIn's [My Network](https://www.linkedin.com/mynetwork/) page
2. Click the extension icon in your toolbar
3. Set your preferences:
   - **Delay (ms)**: Time between connection requests (default: 5000ms)
   - **Max Connections**: Maximum number of connections to send (1-30)
4. Click "Start Connecting" to begin
5. The extension will automatically send connection requests with the specified delay
6. Click "Stop Connecting" to pause at any time

## Best Practices

- Start with a higher delay (5000-10000ms) to avoid rate limiting
- Don't exceed 30 connection requests in a short period
- Monitor the extension to ensure it's working as expected
- Be mindful of LinkedIn's weekly connection request limits

## Troubleshooting

- **Buttons not being clicked**: Ensure you're on the correct LinkedIn page and the buttons are visible
- **Extension not working**: Try refreshing the page and ensuring you're logged in
- **Connection limit reached**: LinkedIn may have temporarily limited your account. Wait before sending more requests

## Privacy

This extension only accesses LinkedIn's website and does not collect or store any personal information. All processing happens locally in your browser.

## Version History

- **v2.6** - Added customizable delay between connections
- **v2.5** - Added max connections limit (30)
- **v2.0** - Initial release with basic functionality

## License

This project is open source and available under the MIT License.

## Disclaimer

This extension is for personal use only. Please respect LinkedIn's Terms of Service and use this tool responsibly. The developers are not responsible for any account restrictions that may result from using this extension.

---

*Note: This extension is not affiliated with or endorsed by LinkedIn.*
