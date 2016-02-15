var extensionOn = true;

chrome.browserAction.onClicked.addListener(function(tab) {
	extensionOn = !extensionOn;
});

chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
    if (req.cmd == "getExtensionState") {
        sendResponse(extensionOn);
    }
});
