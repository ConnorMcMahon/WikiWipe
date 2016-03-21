var userID;

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

//Adds message listener to return user ID and experiment state
chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
	var response = {
		"userID": userID
	}
    if (req.cmd === "getUserInfo") {
    	console.log(response);
        sendResponse(response);
    }
});
