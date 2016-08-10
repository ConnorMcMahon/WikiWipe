const SERVER = "https://wikiwipe.grouplens.org"
const SESSION_TIMEOUT = 30 * 60 *1000//30 minutes
const control_weight = .33;
const EXPERIMENT_CONDITIONS = ["unchanged", "links", "assets"]
const other_weight = (1-control_weight) / (EXPERIMENT_CONDITIONS.length-1);

var weight_list = [control_weight];
for(var i = 0; i < EXPERIMENT_CONDITIONS.length-1; i++){
    weight_list.push(other_weight);
}

function generateWeighedList(list, weight) {
    var weighed_list = [];
     
    // Loop over weights
    for (var i = 0; i < weight.length; i++) {
        var multiples = weight[i] * 100;
         
        // Loop over the list of items
        for (var j = 0; j < multiples; j++) {
            weighed_list.push(list[i]);
        }
    }
     
    return weighed_list;
};

weighted_list = generateWeighedList(EXPERIMENT_CONDITIONS, weight_list);

//Send the log entry to the server
function updateServer(type, logEntry) {
	var queryString;
	if(type === "search") {
		queryString = "/addLog";
	} else if (type === "wiki") {
		queryString = "/addWikiLog";
	}

    // var blob = new Blob([JSON.stringify(logEntry)], {type : 'application/json; charset=UTF-8'});
    jQuery.ajax({
        type: "POST",
        url: SERVER + queryString,
        data: logEntry
    })
    // var success = navigator.sendBeacon(SERVER+queryString, blob);
}

function registerClick(logEntry, element) {
    var queryString = "/addClick";
    jQuery.ajax({
        type: "POST",
        url: SERVER + queryString,
        data: {
            "queryID": logEntry.queryID,
            "clickedElement": element.outerHTML,
            "timestamp": Date.now()
        }
    });
}

function getNewExperimentCondition(type, userID, sessionID) {
    var condition = weighted_list[Math.floor(Math.random() * weighted_list.length)];
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

function getLatestSessionInfo(type, userID, callback) {
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
            if(data.id) {
                if(data.lastTimestamp) {
                    var diff = Date.now() - data.lastTimestamp;
                    if (diff > SESSION_TIMEOUT) {
                        sessionInfo.id = parseInt(data.id) + 1
                        sessionInfo.experimentCondition = getNewExperimentCondition(type, userID, sessionInfo.id);
                    } else {
                        sessionInfo.id = parseInt(data.id);
                        sessionInfo.experimentCondition = data.experimentState;
                    }
                } else {
                        sessionInfo.id = parseInt(data.id);
                        sessionInfo.experimentCondition = data.experimentState;
                }

            } else {
                sessionInfo.id = 1;
                sessionInfo.experimentCondition = getNewExperimentCondition(type, userID, sessionInfo.id);
            }
            callback(sessionInfo);
        }
    });
}

