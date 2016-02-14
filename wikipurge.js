const ELEMENT_PARENT = document.body
const PAGE_DELAY = 1000 * .3

//Wiki-based classes
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw kno-kp g-blk'
const FACTOID_CLASS = 'g mnr-c g-blk'
const SEARCH_RESULTS_CLASS = 'rc'

//General Google DOM ids
const SEARCH_BOX_ID = 'lst-ib'
const DID_YOU_MEAN_CLASS = 'spell'
const ORIG_SPELLING_CLASS = 'spell_orig'
const VOICE_SEARCH_ID = 'gs_st0'
const GOOGLE_BODY = 'rcnt'

const WIKI_REGEX = /.*\.wikipedia\.org.*/

var loggedQuery = false;

var removeWikiData = true;

var logEntry = {};

var querySent = false;

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes && (mutation.addedNodes.length > 0) && removeWikiData) {
            //locates any potential dom elements to remove
            var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
            var factoids = document.getElementsByClassName(FACTOID_CLASS);
            var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
            logEntry.numWikiLinksRemoved = 0;
            
            if (knowledgeBoxes) {
                for(var i = 0; i < knowledgeBoxes.length; i++){
                    //hides the knowledge box
                    knowledgeBoxes[i].style.setProperty('display', 'none', 'important');
                }
                logEntry.removeKnowledgeBox = true;
            }

            if (factoids) {
                for(var i = 0; i < factoids.length; i++){
                    //Find the source in the html
                    var isSourced = factoids[i].childNodes[1].childNodes.length > 1;

                    var isWikiData = !isSourced;

                    //hides the factoid if it is from WikiData
                    if (isWikiData) {
                        factoids[i].style.setProperty('display', 'none', 'important');
                        logEntry.removeFactoid = true;
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
    });
});


//Initialization Code

//A listener function that sends logging information
var queryEnd = function(evt) {
    if (!querySent){
        // observer.observe(ELEMENT_PARENT, {
        //     childList: true,
        //     subtree: true
        // });
        
        var searchBox = document.getElementById(SEARCH_BOX_ID);
        logEntry.queryName = searchBox.value

        logEntry = {}
        //todo send the log information to the server
    }
    querySent = true;
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

if (document.readyState != 'loading'){
    initializeLoggingListeners();
} else {
    document.addEventListener('DOMContentLoaded', initializeLoggingListeners);
}


//creates the mutation observer that hides wiki related DOM objects
observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

var restorePage = function(observer) {
    //keeps attempting to restore body every .1 sec until successful
    var interval = setInterval(function(){
        body = document.getElementById(GOOGLE_BODY);
        if (body){
            body.style.setProperty('display', 'block');
            //prevents the mutation observer from removing any further elements
            observer.disconnect();
            clearInterval(interval);
        }
    }, 100);  
}

//after a specified ammount of time, page is displayed to the user.
setTimeout(function() {
    restorePage(observer);
}, PAGE_DELAY);

window.onbeforeunload = function() {
    queryEnd(null);
};