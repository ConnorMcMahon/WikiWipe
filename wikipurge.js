const ELEMENT_PARENT = document.body;
const PAGE_DELAY = 1000*.2;

//Wiki-based classes
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw kno-kp g-blk';
const ANSWERS_CLASS = 'g mnr-c g-blk';
const FACTOID_CLASS = "kp-blk _rod _Rqb _RJe"
const QA_BOX_CLASS = "kp-blk _Jw _thf _Rqb _RJe"
const SEARCH_RESULTS_CLASS = 'rc';

//General Google DOM ids
const SEARCH_BOX_ID = 'lst-ib';
const DID_YOU_MEAN_CLASS = 'spell';
const ORIG_SPELLING_CLASS = 'spell_orig';
const VOICE_SEARCH_ID = 'gs_st0';
const GOOGLE_BODY = 'rcnt';

const WIKI_REGEX = /.*\.wikipedia\.org.*/;

//Global Vars

var logEntry = {};
var querySent = false;

//Removes WikiRelated DOM elements
var removeDOMElements = function() {
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    logEntry.numWikiLinksRemoved = 0;
    
    if (knowledgeBoxes) {
        for(var i = 0; i < knowledgeBoxes.length; i++){
            //hides the knowledge box
            knowledgeBoxes[i].style.setProperty('display', 'none', 'important');
        }
        logEntry.removeKnowledgeBox = true;
    }

    if (answers) {
        for(var i = 0; i < answers.length; i++){
            var targetElement = answers[i].childNodes[0];
            var isFactoid = (targetElement.getAttribute("class") == FACTOID_CLASS);
            var isQABox = (targetElement.getAttribute("class") == QA_BOX_CLASS);
            
            if (isFactoid){
                //Find the source in the html
                var isSourced = answers[i].childNodes[1].childNodes.length > 1;

                var isWikiData = !isSourced;

                //hides the factoid if it is from WikiData
                if (isWikiData) {
                    answers[i].style.setProperty('display', 'none', 'important');
                    logEntry.removeFactoid = true;
                }
            } else if (isQABox) {
                var questions = targetElement.getElementsByClassName("related-question-pair");
                for(var j = 0; j < questions.length; j++){
                    var answerLink = questions[j].getElementsByClassName("_Rm")[0].innerHTML;
                    var isWikiLink = WIKI_REGEX.test(answerLink);
                    if (isWikiLink) {
                        questions[j].style.setProperty('display', 'none', 'important');
                    }
                }
            }

        }
    }

    if (searchResults) {
        for(var i = 0; i < searchResults.length; i++){
            //finds the link of the search result
            var linkName = searchResults[i].childNodes[0].childNodes[0].href
            //determines if link is from wikipedia using regex
            var isWikiLink = WIKI_REGEX.test(linkName);
            //hides the link if it is from wikipedia
            if (isWikiLink){
                searchResults[i].style.setProperty('display', 'none', 'important');
                logEntry.numWikiLinksRemoved++;           
            }
        }
    }

}

//DOM LISTENER
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes && (mutation.addedNodes.length > 0)) {
            removeDOMElements();
        }
    });
});

//FUNCTIONS

//A listener function that sends logging information
var queryEnd = function(evt) {
    if (!querySent){
        observer.observe(ELEMENT_PARENT, {
            childList: true,
            subtree: true
        });
        
        var searchBox = document.getElementById(SEARCH_BOX_ID);
        logEntry.queryName = searchBox.value
        alert(JSON.stringify(logEntry));

        logEntry = {}
        querySent = true;
        //todo send the log information to the server
    }
}

//Finds all entities that could indicate a new search query after page loads
var initializeLoggingListeners = function(){
    //place logging handlers on things that indicate a new search
    var searchBox = document.getElementById(SEARCH_BOX_ID);
    var voiceSearch = document.getElementById(VOICE_SEARCH_ID);
    var suggestedQuery = document.getElementsByClassName(DID_YOU_MEAN_CLASS)[1];
    var originalQuery = document.getElementsByClassName(ORIG_SPELLING_CLASS)[1];
    
    var queryEnders = [searchBox, voiceSearch, suggestedQuery, originalQuery];
    queryEnders.forEach(function(element, index, array){
        if (element != null){
            element.addEventListener('click', queryEnd);
        }
    });

    //Place logging handlers on search links
    var searchLinks = [];
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    for(var i = 0; i < searchResults.length; i++){
        var link = searchResults[i].childNodes[0];
        searchLinks.push(link);
    }

    searchLinks.forEach(function(element, index, array){
        element.addEventListener("click", function(evt){
            //todo log which link was picked
            logEntry.linkRank = index + 1;
            if (logEntry.numWikiLinksRemoved != null){
                logEntry.linkRank -= logEntry.numWikiLinksRemoved;
            }
            logEntry.linkURL = element.childNodes[0].getAttribute("data-href");
            queryEnd(evt);
        });
    });
};

//Displays the body and stops any removals from occuring
var restorePage = function(observer) {
    //keeps attempting to restore body every .1 sec until successful
    var interval = setInterval(function(){
        body = document.getElementById(GOOGLE_BODY);
        if (body){
            body.style.setProperty('display', 'block');
            //line below causes race condition
            //observer.disconnect();
            clearInterval(interval);
        }
    }, 100);  
}

var restoreModifications = function() {
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var factoids = document.getElementsByClassName(FACTOID_CLASS);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);

    //restores knowledge boxes
    if (knowledgeBoxes) {
        for(var i = 0; i < knowledgeBoxes.length; i++) {
            knowledgeBoxes[i].style.setProperty('display', 'block');
        }
    }

    //restores factoids
    if (factoids) {
        for(var i = 0; i < factoids.length; i++) {
            factoids[i].style.setProperty('display', 'block');
        }
    }

    //restores search results
    if (searchResults) {
        for(var i = 0; i < searchResults.length; i++) {
            searchResults[i].style.setProperty('display', 'block');
        }
    }
}

//creates the mutation observer that hides wiki related DOM objects
observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getExtensionState" }, function (response) {
    //if script is running, run the script
    if (response == true) {
        //establish the listeners on the loggers
        if (document.readyState != 'loading'){
            initializeLoggingListeners();
        } else {
            document.addEventListener('DOMContentLoaded', initializeLoggingListeners);
        }

        //Ensure that if the page is exitewd out of it is logged
        window.onbeforeunload = function() {
            queryEnd(null);
        };

        //after a specified ammount of time, page is displayed to the user.
        setTimeout(function() {
            restorePage(observer);
        }, 1000);
    } else {
        //prevents the observer from removing any more DOM elements
        observer.disconnect()

        //restores hidden DOM elements
        restoreModifications();

        //after a specified ammount of time, page is displayed to the user.
        setTimeout(function() {
            restorePage(observer);
        }, PAGE_DELAY);
    }
});


