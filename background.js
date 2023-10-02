// background.js

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'openRecording' && message.url) {
    chrome.tabs.create({ url: message.url });
  }
});
