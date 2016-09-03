const ELEMENT_PARENT = document.body;
const PAGE_DELAY = 1000*.3;
const EXPERIMENT_DURATION = 1000 * 60 * 30; //milliseconds in 30 minutes

//Asset based constants
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw g-blk';
const KNOWLEDGE_BOX_CLASS2 = "g kno-kp mnr-c g-blk"
const DETAILED_HEADER_CLASS = "_f2g";
const QA_BOX_CLASS = 'kp-blk _thf _Rqb _RJe'
const SEARCH_RESULTS_CLASS = 'rc';
const ANSWERS_CLASS = 'g mnr-c g-blk';
const ANSWER_BOX_CLASS = "kp-blk _rod _Rqb _RJe";
const KNOWLEDGE_TABLE_ID = "kx";
const CONTEXT_ANSWER_CLASS = 'kp-blk _Z7 _Rqb _RJe';
const TWITTER_TAG = "g-snapping-carousel";
const SCORES_CLASS = "xpdbox";
const LOCATION_CLASS = "_Xhb";
const EXTRA_WIKI_LINK_CLASS = "nrgt";

//Knowledge assets
const CLASSIFICATION_CLASS = "_gdf";
const SEE_RESULTS_CLASS = "_tdf";
const KNOWLEDGE_DESC_CLASS = "kno-rdesc";
const KNOWLEDGE_TEXT_CLASS = "_RBg"
const NON_WIKI_FACTS = ["Stock price", "Weather", "Hotels", "Getting there", "Local time"];
const KNOWLEDGE_FACTS = "kno-fb-ctx";
const HEADING_CLASS = "_W5e _X5e"
const CATEGORY_CLASS = "_tN"
const CATEGORY_CLASS2 = "mod"
const PROBABLY_WIKI_CATEGORIES = ["Breeds", "Roster", "Albums", "Songs", "TV Shows","Movies and TV shows", "Movies", "Notable Alumni", "Points of interest", "Plays", "Lower classifications", "Books", "Colleges and Universities", "Cast"];
const POSSIBLY_WIKI_CATEGORIES = ["Quotes", "Current Models", "Destination"];
const PICTURE_CLASS = "kno-ibrg";

//Link based constants
const WIKI_REGEX = /.*\.wikipedia\.org.*/;

//General Google DOM ids
const SEARCH_BOX_ID = 'lst-ib';
const DID_YOU_MEAN_CLASS = 'spell';
const ORIG_SPELLING_CLASS = 'spell_orig';
const VOICE_SEARCH_ID = 'gs_st0';
const GOOGLE_BODY = 'rcnt';
const CITE_CLASS = '_Rm'

//Global Vars
var logEntry = {};

//Set to remove all by default
var experimentInProgress = true;
var reloadAllowed = true;

var alreadyLogged =false;

var sizes = {};

_init();

var hide = function(element, condition) {
    if(condition){
        console.log(element);
        element.style.setProperty('display', 'none');
        // element.remove();
    }  
}

var include = function(arr,obj) {
    return (arr.indexOf(obj) !== -1);
}

//generate unique id, found on stack overflow
//http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// jon surrell's answer
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var hideKnowledgeBox = function(knowledgeBox) { 
    var hideParts = true;
    if(experimentCondition === "unchanged" || experimentCondition === "links") {
        hideParts = false;
    }

    if (hideParts && 
        ((experimentCondition === "all" || experimentCondition === "all_assets" || experimentCondition === "links+assets") 
        || knowledgeBox.getElementsByClassName(DETAILED_HEADER_CLASS).length > 0)) 
    {
        hide(knowledgeBox, true);
    }

    var textSection = knowledgeBox.getElementsByClassName(KNOWLEDGE_TEXT_CLASS)[0];
    var classification = knowledgeBox.getElementsByClassName(CLASSIFICATION_CLASS)[0];
    if(textSection) {
        var description = textSection.getElementsByClassName(KNOWLEDGE_DESC_CLASS)[0];
        var facts = textSection.getElementsByClassName(KNOWLEDGE_FACTS);
    }
    var categories = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS),0);
    var categories2 = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS2),0);
    var categoriesCombined = categories.concat(categories2);

    if(description && description.childNodes.length > 1) {
        logEntry.descriptionPresent = true;
        hide(description, hideParts);
    }

    if(classification){
        logEntry.classificationPresent = true;
        hide(classification, hideParts);
    }

    if(facts) {
        logEntry.factsPresent = true;
        for(var i = 0; i < facts.length; i++){
            try {
                var factLabel = facts[i].getElementsByClassName("fl")[0].innerHTML;
                if(!include(NON_WIKI_FACTS, factLabel)){
                    hide(facts[i], hideParts);
                }
            } catch(e) {
                console.log(e);
            }
        } 
    }

    if(categoriesCombined) {
        logEntry.categoriesPresent = true;
        for(var i = 0 ; i < categoriesCombined.length; i++){
            var headings = categoriesCombined[i].getElementsByClassName(HEADING_CLASS);
            if(headings[0]){
                var heading = headings[0].childNodes[0].innerHTML;
                if(heading && heading.innerHTML){
                    heading = heading.innerHTML.innerHTML
                }
                if(include(PROBABLY_WIKI_CATEGORIES, heading) || include(POSSIBLY_WIKI_CATEGORIES, heading)){
                    hide(categoriesCombined[i], hideParts);
                }
            }
        }
    }
}

//Removes WikiRelated DOM elements
var removeDOMElements = function() {
    //locates any potential dom elements to remove
    var knowledgeBoxesFinal = []
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    if(knowledgeBoxes) {
        for(var i = 0; i < knowledgeBoxes.length; i++){
            knowledgeBoxesFinal.push(knowledgeBoxes[i]);
        }
    }
    var knowledgeBoxes2 = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS2);
    if(knowledgeBoxes2) {
        for(var i = 0; i < knowledgeBoxes2.length; i++){
            knowledgeBoxesFinal.push(knowledgeBoxes2[i]);
        }
    }
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var knowledgeChart = document.getElementById(KNOWLEDGE_TABLE_ID);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    var twitterBox = document.getElementsByTagName(TWITTER_TAG)[0];
    var scoresBox = document.getElementsByClassName(SCORES_CLASS)[0];
    var locationBox = document.getElementsByClassName(LOCATION_CLASS)[0];
    var extraWikiLinks = document.getElementsByClassName(EXTRA_WIKI_LINK_CLASS)[0];

    var removeAssets = experimentCondition === "assets" || experimentCondition === "all" || experimentCondition === "assets_all" || experimentCondition === "links+assets";
    var removeLinks = experimentCondition === "all" || experimentCondition === "links" || experimentCondition === "links+assets";
    
    if (knowledgeBoxesFinal) {    
        for(var i = 0; i < knowledgeBoxesFinal.length; i++){
            //check if the "knowledge box" is actually aknowledge box or a "see results box"
            if (knowledgeBoxesFinal[i].getElementsByClassName(SEE_RESULTS_CLASS).length > 0){
                logEntry.seeResultsAboutPresent = true;
                hide(knowledgeBoxesFinal[i], experimentCondition === "all");
            } else {
                logEntry.knowledgeBoxPresent = true;
                hideKnowledgeBox(knowledgeBoxesFinal[i], removeAssets);    
            }   
        }       
    }

    if (answers) {
        for(var i = 0; i < answers.length; i++){
            var targetElement = answers[i].childNodes[0];
            var isAnswerBox = (targetElement.getAttribute("class") == ANSWER_BOX_CLASS);
            var isQABox = answers[i].getElementsByClassName(QA_BOX_CLASS).length > 0;
            var isContextAnswer = (targetElement.getAttribute("class") == CONTEXT_ANSWER_CLASS);

            if (isAnswerBox) {
                logEntry.answerBoxPresent = true;
                //Find the source in the html
                // var isSourced = (answers[i].childNodes[1].childNodes.length > 1) || (answers[i].getElementsByClassName("rc").length > 0);
                // //hides the answer box if it is from WikiData
                // if (!isSourced) {
                //     logEntry.answerBoxUnsourced = true;
                //     hide(answers[i], removeAssets);
                // }
                logEntry.answerBoxUnsourced = true;
                hide(answers[i], removeAssets);
            } else if (isQABox) {
                var questions = targetElement.getElementsByClassName("related-question-pair");
                logEntry.QABoxPresent = true;
                logEntry.questionsFound = questions.length;
                for(var j = 0; j < questions.length; j++){
                    var answerElement = questions[j].getElementsByClassName(CITE_CLASS)[0];
                    if(answerElement){
                        var answerLink = answerElement.innerHTML;
                        var isWikiLink = WIKI_REGEX.test(answerLink);
                        if (isWikiLink) {
                            logEntry.wikiQuestionsFound = true;
                            hide(questions[j], removeAssets);
                        }
                    }
                }
                // hide(answers[i], removeAssets);
            } else if (isContextAnswer) {
                logEntry.contextAnswerBoxPresent = true;
                var hyperLink = answers[i].getElementsByClassName("r")[0].childNodes[0];
                var isWikiLink = WIKI_REGEX.test(hyperLink.getAttribute('href'));
                if (isWikiLink) {
                    logEntry.contextAnswerBoxIsWiki = true;
                    hide(answers[i], removeAssets);  
                }
            }
        }
    }

    if (knowledgeChart){
        logEntry.knowledgeChartPresent = true;
        hide(knowledgeChart, removeAssets);
    }

    if (searchResults) {
        for(var i = 0; i < searchResults.length; i++){
            //finds the link of the search result
            var linkName = searchResults[i].childNodes[0].childNodes[0].href;
            var linkName2 = searchResults[i].childNodes[0].childNodes[0].getAttribute("data-href");
            //determines if link is from wikipedia using regex
            var isWikiLink = WIKI_REGEX.test(linkName) || (linkName2 && WIKI_REGEX.test(linkName2));
            var id = searchResults[i].getAttribute("data-hveid");
            if (isWikiLink){
                logEntry.wikiLinks = true;
            }

            //hides the link if it is from wikipedia
            if (isWikiLink){
                logEntry.numWikiLinks += 1;     
                hide(searchResults[i], removeLinks);  
            }
         }
    }

    if (extraWikiLinks) {
        hide(extraWikiLinks, removeLinks);
    }

    //only in all and assets_all conditions are the below assets removed
    var removeAllAssets = experimentCondition === "all" || experimentCondition === "assets_all";

    if(twitterBox) {
        logEntry.extraAssetPresent = true;
        hide(twitterBox, removeAllAssets);
    }

    if(scoresBox) {
        logEntry.extraAssetPresent = true;
        hide(scoresBox, removeAllAssets);
    }

    if(locationBox) {
        logEntry.extraAssetPresent = true;
        hide(locationBox, removeAllAssets);
    }
}

//FUNCTIONS

//Finds all entities that could indicate a new search query after page loads
var initializeLoggingListeners = function(){
    $("body").on("click", "a", function(evt) {
        evt.preventDefault();
        registerClick(logEntry, evt.target);
    });
    // var links = document.links;
    // for(var i = 0; i < links.length; i++){
    //     var link = links[i];
    //     link.addEventListener("click", function(evt) {
    //         registerClick(logEntry, evt.target);
    //     });
    // }

};

function blockReload() {
    reloadAllowed = false;
}

window.addEventListener("beforeunload", function(evt) {
    blockReload();
});

function clearLogging() {}

function _init(){
    document.getElementsByTagName("html")[0].style.display="none";
    window.onload=function(){
        var currentHash = window.location.hash

        setInterval(function(){
            if (currentHash == null){
                currentHash = window.location.hash;
            } else if(currentHash !== window.location.hash && reloadAllowed){
                window.location.href = "https://www.google.com/search?"+window.location.hash.substring(1);
                window.location.reload(true);
            }
            // if(window.location.hash) {
            //     if(("https://www.google.com/" + window.location.hash) !== window.location.href) {
                    
            //         window.location.reload(true);
            //         console.log("reloading");
            //     }
            // }
        }, 100);
        //Get the value of whether the script is running
        // chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {
        //     try {
        //         //Establish starttime
        //         logEntry.startTime = Date.now();
        //         console.log(response.userID);

        //         initializeLoggingListeners();

        //         var diff = Date.now() - response.startTime;
        //         experimentInProgress = diff <= EXPERIMENT_DURATION;

        //         logEntry.userID = response.userID;
        //         if(!logEntry.userID || !experimentInProgress){
        //             clearLogging();
        //             throw "no user id"
        //             return;
        //         }
        //         logEntry.numWikiLinks = 0;

        //         getLatestSessionInfo("search", logEntry.userID, function(sessionInfo) {
        //             try {
        //                 experimentCondition = sessionInfo.experimentCondition;
        //                 logEntry.sessionID = sessionInfo.id;
        //                 logEntry.queryID = guid();

        //             } 
        //             catch(e) {
        //                 processException(e);
        //                 return;
        //             }
        //         });
        //     } catch(e) {
        //         processException(e);
        //         return;
        //     }
        // });
    }
}

function processException(e){
    console.log(e);
    experimentCondition = "unchanged";
    clearLogging();
    document.getElementsByTagName("html")[0].style.display="";
    console.log("restored");
}

// function processPage() {
//     console.log("processing page");
//     var searchBox = document.getElementById(SEARCH_BOX_ID);
//     logEntry.queryName = searchBox.value;
//     var hash = window.location.hash;
//     // document.getElementsByTagName("html")[0].style.display="";
//     // removeDOMElements();
//     // console.log(logEntry);
//     // updateServer("search", logEntry);
//     if(document.getElementsByClassName(SEARCH_RESULTS_CLASS) && (!hash || searchBox.value === hash.substr(3).replace("+", " "))) {
//         document.getElementsByTagName("html")[0].style.display="";
//         removeDOMElements();
//         console.log(logEntry);
//         updateServer("search", logEntry);
//     } else {
//         setTimeout(processPage, 100);
//     }   
// }





