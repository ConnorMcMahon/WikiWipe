logEntry = 
    { "url": document.URL, 
      "timestamp": Date.now()
    };


console.log(logEntry);
//updates the database with this new log
//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getExperimentInfo" }, function (response) {    
    //Set userID
    logEntry.userID = response.userID;
    getLatestSessionID("wiki", logEntry.userID, function(id){
        logEntry.sessionID = id;
        updateServer("wiki", logEntry);
    });

});
