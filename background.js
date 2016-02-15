var extensionOn = true;

var getIcon = function(extensionOn){
	var path;
	if(extensionOn){
		path = "icon.png"
	} else {
		path = "icon2.png"
	}
	return path;
}

chrome.browserAction.onClicked.addListener(function(tab) {
	extensionOn = !extensionOn;
	iconPath = getIcon(extensionOn);
	chrome.browserAction.setIcon({
		path: iconPath
	});
});

chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
    if (req.cmd == "getExtensionState") {
        sendResponse(extensionOn);
    }
});
