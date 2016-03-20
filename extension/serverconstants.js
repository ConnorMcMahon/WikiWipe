const SERVER = "https://wikiwipe.grouplens.org"
const SESSION_TIMEOUT = 30 * 60 *1000//30 minutes

//Send the log entry to the server
var updateServer = function(type, logEntry) {
	var queryString;
	if(type === "search") {
		queryString = "/addLog";
	} else if (type === "wiki") {
		queryString = "/addWikiLog";
	}
    var blob = new Blob([JSON.stringify(logEntry)], {type : 'application/json; charset=UTF-8'});
    navigator.sendBeacon(SERVER+queryString, blob);
    // jQuery.ajax({
    //     type: "GET",
    //     url: SERVER + queryString + logEntry.userID,
    //     async: false,
    //     success: function(data) {
    //         if (data) {
    //             if(data.logs) {
    //                 //grab last time this session was updated, and starts a new session if it has expired
    //                 var lastSessionTime = data.logs.slice(-1)[0].timestamp;
    //                 if ((logEntry.timestamp - lastSessionTime) > SESSION_TIMEOUT){
    //                     data.logs = [logEntry];
    //                     data.sessionID = parseInt(data.sessionID) + 1
    //                 } else {
    //                     //data.logs = JSON.parse(data.logs);
    //                     data.logs.push(logEntry);
    //                 }
    //             } else {
    //                 data.logs = [logEntry];
    //             }
    //         } else {
    //             data = {
    //                 "userID": userID,
    //                 "sessionID": 1,
    //                 "logs": [logEntry]
    //             }
    //         }
    //         console.log(data);

    //         jQuery.ajax({
    //             type: "POST",
    //             url: SERVER + "/addLog",
    //             data: data,
    //             success: function(data){
    //                 querySent = true;
    //                 console.log("finished update");
    //             }
    //         });
    //     }
    // });
}

var getLatestSessionID = function(type, userID, callback) {
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
            if(data.id && data.lastTimestamp) {
                var diff = Date.now() - data.lastTimestamp;
                if (diff > SESSION_TIMEOUT) {
                    callback(parseInt(data.id) + 1);
                } else {
                    callback(parseInt(data.id));
                }
            } else {
                callback(1);
            }
            
        }
    });
}

