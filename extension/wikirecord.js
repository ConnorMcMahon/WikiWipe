logEntry = 
    { "url": document.URL, 
      "startTime": Date.now()
    };


console.log(logEntry);
//updates the database with this new log
//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {    
    //Set userID
    logEntry.userID = response.userID;
    getLatestSessionInfo("wiki", logEntry.userID, function(sessionInfo){
        logEntry.sessionID = sessionInfo.id;
        //irrelevant for actual data collection, but used in generic server functions
        logEntry.experimentState = sessionInfo.experimentState;

        //Ensure that if the page is exited out of it is logged
        //uses beforeunload instead of unload to allow click event to occur
        window.addEventListener("beforeunload", function(evt) {
            updateServer("wiki", logEntry);
        });
        
    });

});
