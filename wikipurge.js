const ELEMENT_PARENT = document.body

//Wiki-based classes
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw kno-kp g-blk'
const FACTOID_CLASS = 'g mnr-c g-blk'
const SEARCH_RESULTS_CLASS = 'rc'

//General Google DOM ids
const SEARCH_BOX_ID = 'lst-ib'
const DID_YOU_MEAN_CLASS = 'spell'
const ORIG_SPELLING_CLASS = 'spell_orig'
const VOICE_SEARCH_ID = 'gs_st0'

const WIKI_REGEX = /.*\.wikipedia\.org.*/

var foundWikiData = false;
var loggedQuery = false;

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes && (mutation.addedNodes.length > 0)) {
            //locates any potential dom elements to remove
            var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
            var factoids = document.getElementsByClassName(FACTOID_CLASS);
            var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
            
            if (knowledgeBoxes) {
                for(var i = 0; i < knowledgeBoxes.length; i++){
                    //hides the knowledge box
                    knowledgeBoxes[i].style.setProperty('display', 'none', 'important');
                }
                foundWikiData = true;
            }

            if (factoids) {
                for(var i = 0; i < factoids.length; i++){
                    //hides the factoid
                    factoids[i].style.setProperty('display', 'none', 'important');
                }
                foundWikiData = true;
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
                        foundWikiData = true;
                    }
                }
            }

            if (foundWikiData && !loggedQuery) {
                //TODO: add some logging features here
                loggedQuery = true;
            }
        }
    });
});


//Initialization Code

//Finds all entities that could indicate a new search query after page loads

var initializeQueryListeners = function(){
    var searchBox = document.getElementById(SEARCH_BOX_ID);
    var voiceSearch = document.getElementById(VOICE_SEARCH_ID);
    var suggestedQuery = document.getElementsByClassName(DID_YOU_MEAN_CLASS)[1];
    console.log(suggestedQuery);
    var originalQuery = document.getElementsByClassName(ORIG_SPELLING_CLASS)[1];
    console.log(originalQuery);

    queryStarters = [searchBox, voiceSearch, suggestedQuery, originalQuery];

    var queryReset = function(evt) {
        loggedQuery = false;
        console.log('reset loggedQuery');
    }

    queryStarters.forEach(function(element, index, array){
        element.addEventListener('click', queryReset);
    });   
}

if (document.readyState != 'loading'){
    initializeQueryListeners();
} else {
    document.addEventListener('DOMContentLoaded', initializeQueryListeners);
}

// searchBox.addEventListener('click', function(evt){
//     loggedQuery = false;
//     console.log('reset loggedQuery');
// });

//creates the mutation observer that hides wiki related DOM objects
observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

