const SERVER = "https://wikiwipe.grouplens.org"
const SESSION_TIMEOUT = 30 * 60 *1000//30 minutes
const EXPERIMENT_CONDITIONS = ["no_wiki", "no_UCG", "unchanged"];

//Send the log entry to the server
var updateServer = function(type, logEntry) {
	var queryString;
	if(type === "search") {
		queryString = "/addLog";
	} else if (type === "wiki") {
		queryString = "/addWikiLog";
	}
    logEntry.timestamp = Date.now();

    var blob = new Blob([JSON.stringify(logEntry)], {type : 'application/json; charset=UTF-8'});
    navigator.sendBeacon(SERVER+queryString, blob);
}

var getNewExperimentCondition = function() {
    return EXPERIMENT_CONDITIONS[Math.floor(Math.random() * (EXPERIMENT_CONDITIONS.length-1)) + 1];
}

var getLatestSessionInfo = function(type, userID, callback) {
    var queryString;
    if(type === "search") {
        queryString = "/getLatestSessionID";
    } else if (type === "wiki") {
        queryString = "/getLatestWikiSessionID";
    }
    jQuery.ajax({
        type:  "GET",
        url:  SERVER + queryString + "?id=" + userID,
        success: function(data) {
            var sessionInfo = {}
            if(data.id && data.lastTimestamp) {
                var diff = Date.now() - data.lastTimestamp;
                if (diff > SESSION_TIMEOUT) {
                    sessionInfo.id = parseInt(data.id) + 1
                    sessionInfo.experimentState = getNewExperimentCondition();
                } else {
                    sessionInfo.id = parseInt(data.id);
                    sessionInfo.experimentState = data.experimentState;
                }
            } else {
                sessionInfo.id = 1;
                sessionInfo.experimentState = getNewExperimentCondition();
            }
            callback(sessionInfo);
        }
    });
}

