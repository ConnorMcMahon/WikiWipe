const SERVER = "https://wikiwipe.grouplens.org"
const SESSION_TIMEOUT = 30 * 60 *1000//30 minutes

logEntry = 
	{ "url": document.URL, 
	  "timestamp": Date.now()
	};

userID = 10;

console.log(logEntry);
//updates the database with this new log
jQuery.ajax({
    type: "GET",
    url: SERVER + "/getLatestWikiSession/?id=" + userID,
    success: function(data) {
        if (data) {
            if(data.logs) {
                //grab last time this session was updated, and starts a new session if it has expired
                var lastSessionTime = data.logs.slice(-1)[0].timestamp;
                if ((logEntry.timestamp - lastSessionTime) > SESSION_TIMEOUT){
                    data.logs = [logEntry];
                    data.sessionID = parseInt(data.sessionID) + 1
                } else {
                    data.logs.push(logEntry);
                }
            } else {
            	//if data.logs is returned as string, parse
            	try {
            		data.logs = JSON.parse(data.logs);
            	} catch(err) {
            		console.log(err);
            	}
                data.logs = [logEntry];
            }
        } else {
            data = {
                "userID": userID,
                "sessionID": 1,
                "logs": [logEntry]
            }
        }


        jQuery.ajax({
            type: "POST",
            url: SERVER + "/addWikiLog",
            data: data,
            success: function(data){
                querySent = true;
            }
        });
    }
});