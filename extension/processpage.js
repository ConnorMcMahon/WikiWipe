chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {
    try {
        //Establish starttime
        logEntry.startTime = Date.now();
        console.log(response.userID);

        initializeLoggingListeners();

        var diff = Date.now() - response.startTime;
        experimentInProgress = diff <= EXPERIMENT_DURATION;

        logEntry.userID = response.userID;
        if(!logEntry.userID || !experimentInProgress){
            clearLogging();
            throw "no user id"
            return;
        }
        logEntry.numWikiLinks = 0;

        getLatestSessionInfo("search", logEntry.userID, function(sessionInfo) {
            try {
                experimentCondition = sessionInfo.experimentCondition;
                logEntry.sessionID = sessionInfo.id;
                logEntry.queryID = guid();
				processPage();
            } 
            catch(e) {
                processException(e);
                return;
            }
        });
    } catch(e) {
        processException(e);
        return;
    }
});

var tries = 0;

function processPage() {
    try {
        if(document.getElementsByClassName("g").length > 5 && document.getElementById("rcnt")) {
            logEntry.body = document.getElementById("rcnt").innerHTML;  
            var searchBox = document.getElementById(SEARCH_BOX_ID);
            console.log(experimentCondition);
            logEntry.experimentCondition = experimentCondition;
            logEntry.queryName = searchBox.value;
            removeDOMElements();
            document.getElementsByTagName("html")[0].style.display="";
            console.log(logEntry);
            updateServer("search", logEntry);
        } else if (tries > 10){
            console.log("tried more than 10 times")
            var searchBox = document.getElementById(SEARCH_BOX_ID);
            console.log(experimentCondition);
            logEntry.experimentCondition = experimentCondition;
            logEntry.queryName = searchBox.value;
            removeDOMElements();
            document.getElementsByTagName("html")[0].style.display="";
            console.log(logEntry);
            updateServer("search", logEntry);
        } 
        else {
            tries += 1;
            setTimeout(processPage, 100);
        }
    } catch(e) {
        processException(e);
    }

}

