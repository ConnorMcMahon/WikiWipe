const ELEMENT_PARENT = document.body

const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw kno-kp g-blk'
const FACTOID_CLASS = 'g mnr-c g-blk'
const SEARCH_RESULTS_CLASS = 'rc'

const WIKI_REGEX = /.*\.wikipedia\.org.*/

var foundWikiData = false;
var loggedSearchInfo = false;

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

            if (foundWikiData && !loggedSearchInfo) {
                //TODO: add some logging features here
                loggedSearchInfo = true;
            }
        }
    });
});



observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

