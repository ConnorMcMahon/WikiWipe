logEntry = 
    { "url": document.URL, 
      "timestamp": Date.now()
    };


console.log(logEntry);
//updates the database with this new log
//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {    
    //Set userID
    logEntry.userID = response.userID;
    getLatestSessionInfo("wiki", logEntry.userID, function(sessionInfo){
        logEntry.sessionID = sessionInfo.id;
        logEntry.experimentState = sessionInfo.experimentState;
        updateServer("wiki", logEntry);
    });

});
