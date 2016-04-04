const SERVER = "https://wikiwipe.grouplens.org"
const SESSION_TIMEOUT = 30 * 60 *1000//30 minutes
const EXPERIMENT_CONDITIONS = ["unchanged", "lowerbound", "lowerbound+links", "middlebound", "middlebound+links", "upperbound", "upperbound+links", "all"];

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

var getNewExperimentCondition = function(type, userID, sessionID) {
    var condition = EXPERIMENT_CONDITIONS[Math.floor(Math.random() * EXPERIMENT_CONDITIONS.length)];
    var queryString;
    if(type === "search") {
        queryString = "/addSession";
    } else if (type === "wiki") {
        queryString = "/addWikiSession";
    }
    jQuery.ajax({
        type: "POST",
        url : SERVER + queryString,
        data: {
                "experimentCondition": condition,
                "sessionID": sessionID,
                "userID": userID
            }
    });
    return condition;
}

var getLatestSessionInfo = function(type, userID, callback) {
    // var queryString;
    // if(type === "search") {
    //     queryString = "/getLatestSessionID";
    // } else if (type === "wiki") {
    //     queryString = "/getLatestWikiSessionID";
    // }
    // jQuery.ajax({
    //     type:  "GET",
    //     url:  SERVER + queryString + "?id=" + userID,
    //     success: function(data) {
    //         console.log(data);
    //         var sessionInfo = {}
    //         if(data.id) {
    //             if(data.lastTimestamp) {
    //                 var diff = Date.now() - data.lastTimestamp;
    //                 if (diff > SESSION_TIMEOUT) {
    //                     sessionInfo.id = parseInt(data.id) + 1
    //                     sessionInfo.experimentCondition = getNewExperimentCondition(type, userID, sessionInfo.id);
    //                 } else {
    //                     sessionInfo.id = parseInt(data.id);
    //                     sessionInfo.experimentCondition = data.experimentState;
    //                 }
    //             } else {
    //                     sessionInfo.id = parseInt(data.id);
    //                     sessionInfo.experimentCondition = data.experimentState;
    //             }

    //         } else {
    //             sessionInfo.id = 1;
    //             sessionInfo.experimentCondition = getNewExperimentCondition(type, userID, sessionInfo.id);
    //         }
    //         console.log(sessionInfo);
    //         callback(sessionInfo);
    //     }
    // });
    callback({id: 1, experimentCondition:"all"});
}

