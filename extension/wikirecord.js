logEntry = 
	{ "url": document.URL, 
	  "timestamp": Date.now()
	};

userID = 10;

console.log(logEntry);
//updates the database with this new log
// jQuery.ajax({
//     type: "GET",
//     url: SERVER + "/getLatestWikiSession/?id=" + userID,
//     success: function(data) {
//         if (data) {
//             //grab last time this session was updated, and starts a new session if it has expired
//             var lastSessionTime = data.logs.slice(-1)[0].timestamp;
//             if ((logEntry.timestamp - lastSessionTime) > SESSION_TIMEOUT){
//                 data.logs = [logEntry];
//                 data.sessionID += 1
//             } else {
//                 data.logs.push(logEntry);
//             }
//         } else {
//             data = {
//                 "userID": userID,
//                 "sessionID": 1,
//                 "logs": [logEntry]
//             }
//         }


//         jQuery.ajax({
//             type: "POST",
//             url: SERVER + "/addWikiLog",
//             data: data,
//             success: function(data){
//                 querySent = true;
//             }
//         });
//     }
// });