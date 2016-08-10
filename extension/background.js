var userID;
var startTime;

// chrome.storage.local.clear(function() {
//     var error = chrome.runtime.lastError;
//     if (error) {
//         console.error(error);
//     }
// });

chrome.storage.local.get('userid', function(items) {
    userID = items.userid;
});

var idQuery = setInterval(function() {
    if(!userID){
        chrome.storage.local.get('userid', function(items) {
            userID = items.userid;
            if(userID){
                clearInterval(idQuery);
            }
        });
    }
    else {
        clearInterval(idQuery);
    }
}, 1000);

chrome.storage.local.get('starttime', function(items) {
	startTime = items.startTime;
	if (!startTime) {
		startTime = Date.now();
		chrome.storage.local.set({starttime: startTime});
	}
});

//Adds message listener to return user ID and experiment state
chrome.runtime.onMessage.addListener(function (req, send, sendResponse) {
	var response = {
		"userID": userID,
		"startTime": startTime
        // "experimentCondition": EXPERIMENT_CONDITIONS[stateCounter]
    };
    if (req.cmd === "getUserInfo") {
        sendResponse(response);
    }
});
