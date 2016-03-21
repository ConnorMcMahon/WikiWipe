var extensionStates = ["no_wiki", "no_UCG", "unchanged"];
var icons = ["icon.png", "icon2.png", "icon3.png"];

var stateCounter = 0;
var userID;

var getIcon = function(extensionOn){
	var path;
	if(extensionOn){
		path = "icon.png"
	} else {
		path = "icon2.png"
	}
	return path;
}

//Generate an unused user id
var generateToken = function(callback) {
    jQuery.ajax({
        type: "GET",
        url: SERVER + "/getNewUserID",
        success: function(data) {
            userID = parseInt(data);
            callback();
        }

    });
}


//Grabs existing user id or generates new one and sets it to storage
chrome.storage.sync.get('userid', function(items) {
    userID = items.userid;
    if (!userID) {
        userid = generateToken(function() {
            chrome.storage.sync.set({userid: userID});
        });
    }
});

//Tries to disable answers from appearing in omnibox
chrome.omnibox.setDefaultSuggestion({description: "Autofill disabled"});

//Adds listener to clicking on icon to change icon and experiment state
chrome.browserAction.onClicked.addListener(function(tab) {
	stateCounter = (stateCounter + 1) % 3; 
	iconPath = icons[stateCounter];
	chrome.browserAction.setIcon({
		path: iconPath
	});
});

//Adds message listener to return user ID and experiment state
chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
	var response = {
		"experimentState": extensionStates[stateCounter],
		"userID": userID
	}
    if (req.cmd === "getUserInfo") {
    	console.log(response);
        sendResponse(response);
    }
});
