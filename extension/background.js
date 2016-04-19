var userID;
var startTime;
// const EXPERIMENT_CONDITIONS = ["unchanged", "lowerbound", "lowerbound+links", "middlebound", "middlebound+links", "upperbound", "upperbound+links", "all"];
// var stateCounter = 0;

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

chrome.storage.sync.get('starttime', function(items) {
	startTime = items.startTime;
	if (!startTime) {
		startTime = Date.now();
		chrome.storage.sync.set({starttime: startTime});
	}
});


// chrome.browserAction.onClicked.addListener(function(tab) {
//     stateCounter = (stateCounter + 1) % EXPERIMENT_CONDITIONS.length; 
//     chrome.browserAction.setTitle({title: EXPERIMENT_CONDITIONS[stateCounter]});
// });

// chrome.browserAction.setTitle({title: EXPERIMENT_CONDITIONS[stateCounter]});

//Tries to disable answers from appearing in omnibox
// chrome.omnibox.setDefaultSuggestion({description: "Autofill disabled"});

//Adds message listener to return user ID and experiment state
chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
	var response = {
		"userID": userID,
		"startTime": startTime
        // "experimentCondition": EXPERIMENT_CONDITIONS[stateCounter]
	}
    if (req.cmd === "getUserInfo") {
    	console.log(response);
        sendResponse(response);
    }
});
