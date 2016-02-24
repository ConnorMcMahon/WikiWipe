var extensionStates = ["no_wiki", "no_UCG", "unchanged"];
var icons = ["icon.png", "icon2.png", "icon3.png"];

var stateCounter = 0;

var getIcon = function(extensionOn){
	var path;
	if(extensionOn){
		path = "icon.png"
	} else {
		path = "icon2.png"
	}
	return path;
}

chrome.omnibox.setDefaultSuggestion({description: "Autofill disabled"});

chrome.browserAction.onClicked.addListener(function(tab) {
	stateCounter = (stateCounter + 1) % 3; 
	iconPath = icons[stateCounter];
	chrome.browserAction.setIcon({
		path: iconPath
	});
});

chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
    if (req.cmd == "getExtensionState") {
        sendResponse(extensionStates[stateCounter]);
    }
});
