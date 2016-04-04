const ELEMENT_PARENT = document.body;
const PAGE_DELAY = 1000*.3;
const EXPERIMENT_DURATION = 1000 * 60 * 60 * 24 * 7 * 3; //milliseconds in 3 weeks
const EXPERIMENT_CONDITIONS = ["unchanged", "lowerbound", "lowerbound+links", "middlebound", "middlebound+links", "upperbound", "upperbound+links", "all"];


//Asset based constants
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw kno-kp g-blk';
const QA_BOX_CLASS = 'kp-blk _Jw _thf _Rqb _RJe'
const SEARCH_RESULTS_CLASS = 'rc';
const ANSWERS_CLASS = 'g mnr-c g-blk';
const ANSWER_BOX_CLASS = "kp-blk _rod _Rqb _RJe";
const KNOWLEDGE_TABLE_ID = "kx";
const CONTEXT_ANSWER_CLASS = 'kp-blk _Z7 _Rqb _RJe';
const TWITTER_TAG = "g-snapping-carousel";


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
var removedLinks = []

//Set to remove all by default
var experimentCondition = "all"
var experimentInProgress = true;

var alreadyLogged =false;

var sizes = {}

var hide = function(element) {
    element.style.setProperty('display', 'none');
}

var restore = function(element) {
    element.style.setProperty('display', 'block');
}

var include = function(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

var getElementSize = function(element) {
    var id = element.getAttribute("data-hveid");
    if (!sizes[id]) {
        var currentStyle = element.style.display;
        element.style.setProperty('display', 'block');
        sizes[id] = element.offsetHeight * element.offsetWidth;
        element.style.setProperty('display', currentStyle); 
    }
    return sizes[id]
}

//Removes WikiRelated DOM elements
var removeDOMElements = function() {
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var knowledgeChart = document.getElementById(KNOWLEDGE_TABLE_ID);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    var twitterBox = document.getElementsByTagName(TWITTER_TAG)[0];
    
    if (knowledgeBoxes) {
        logEntry.knowledgeBoxPresent = true;
        for(var i = 0; i < knowledgeBoxes.length; i++){
            logEntry.knowledgeBoxSize = getElementSize(knowledgeBoxes[i]);
            //hides the knowledge box  
            hide(knowledgeBoxes[i]);
            logEntry.removeKnowledgeBox = true;
            
        }       
    }

    if (answers) {
        for(var i = 0; i < answers.length; i++){
            var targetElement = answers[i].childNodes[0];
            var isAnswerBox = (targetElement.getAttribute("class") == ANSWER_BOX_CLASS);
            var isQABox = (targetElement.getAttribute("class") == QA_BOX_CLASS);
            var isContextAnswer = (targetElement.getAttribute("class") == CONTEXT_ANSWER_CLASS);

            if (isAnswerBox) {
                logEntry.answerBoxPresent = true;
                logEntry.answerBoxSize = getElementSize(answers[i]);
                //Find the source in the html
                var isSourced = (answers[i].childNodes[1].childNodes.length > 1) || (answers[i].getElementsByClassName("rc").length > 0);

                //hides the answer box if it is from WikiData
                if (!isSourced && include(EXPERIMENT_CONDITIONS.splice(3),experimentCondition)) {
                    hide(answers[i]);
                    logEntry.removeAnswerBox = true;
                }
            } else if (isQABox) {
                var questions = targetElement.getElementsByClassName("related-question-pair");
                logEntry.questionsSize = getElementSize(answers[i]);
                logEntry.questionsFound = questions.length;
                logEntry.questionsRemoved = 0;
                for(var j = 0; j < questions.length; j++){
                    var answerLink = questions[j].getElementsByClassName(CITE_CLASS)[0].innerHTML;
                    var isWikiLink = WIKI_REGEX.test(answerLink);
                    if (isWikiLink && experimentCondition !== "unchanged") {
                        hide(questions[j]);
                        logEntry.questionsRemoved += 1
                    }
                }
            } else if (isContextAnswer) {
                logEntry.contextAnswerBoxPresent = true;
                logEntry.contextAnswerBoxSize = getElementSize(answers[i]);
                var hyperLink = answers[i].getElementsByClassName("r")[0].childNodes[0];
                var isWikiLink = WIKI_REGEX.test(hyperLink.getAttribute('href'));
                if (isWikiLink && experimentCondition !== "unchanged") {
                    hide(answers[i]);
                    logEntry.removeContextAnswerBox = true;
                }
            }
        }
    }

    if (knowledgeChart){
        logEntry.knowledgeChartPresent = true;
        logEntry.knowledgeChartSize = getElementSize(knowledgeChart);
        if(include(EXPERIMENTCONDITIONS.splice(3), experimentCondition)) {
            hide(knowledgeChart);
            logEntry.knowledgeChartRemoved = true;
        }
    }

    if (searchResults) {
        for(var i = 0; i < searchResults.length; i++){
            //finds the link of the search result
            var linkName = searchResults[i].childNodes[0].childNodes[0].href
            //determines if link is from wikipedia using regex
            var isWikiLink = WIKI_REGEX.test(linkName);

            var id = searchResults[i].getAttribute("data-hveid");
            //hides the link if it is from wikipedia
            if (isWikiLink && removedLinks.indexOf(id) === -1){
                console.log("hidding link");
                hide(searchResults[i]);
                removedLinks.push(id);
                logEntry.numWikiLinksRemoved += 1;           
            }
         }
    }

    if(twitterBox) {
        logEntry.twitterPresent = true;
        logEntry.twitterSize = getElementSize(twitterBox);
        if(experimentCondition === "all"){
            logEntry.twitterRemoved = true;
            hide(twitterBox);
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
    if(experimentInProgress && !alreadyLogged){
        alreadyLogged = true;
        try {
            var searchBox = document.getElementById(SEARCH_BOX_ID);
            logEntry.queryName = searchBox.value;

            updateServer("search", logEntry);

        } catch(e) {
            console.log(e);
        }
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

var restoreModifications = function(state) {
    console.log(state);
    //if all UCG content is to be removed, nothing needs to be restored
    if (state === "all"){
        return;
    }
    
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var knowledgeChart = document.getElementById(KNOWLEDGE_TABLE_ID);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    var twitterBox = document.getElementsByTagName(TWITTER_TAG)[0];

    //restores knowledge boxes
    if (state === "unchanged" && knowledgeBoxes) {
        for(var i = 0; i < knowledgeBoxes.length; i++) {
            restore(knowledgeBoxes[i]);
        }
        logEntry.removeKnowledgeBox = false;
    }

    //restores answer boxes and if state is unchanged then also QA Boxes
    if (answers) {        
        for(var i = 0; i < answers.length; i++) {
            var targetElement = answers[i].childNodes[0];
            var isAnswerBox = (targetElement.getAttribute("class") === ANSWER_BOX_CLASS);
            var isQABox = (targetElement.getAttribute("class") === QA_BOX_CLASS);
            var isContextAnswer = (targetElement.getAttribute("class") === CONTEXT_ANSWER_CLASS);

            if (isAnswerBox){
                logEntry.removeAnswerBox = false;
                restore(answers[i]);
            } else if (state === "unchanged" && isQABox) {
                var questions = targetElement.getElementsByClassName("related-question-pair");
                for(var j = 0; j < questions.length; j++){
                    restore(questions[j]);
                }
                logEntry.questionsRemoved = 0;
            } else if (state === "unchanged" && isContextAnswer){
                logEntry.contextAnswerBoxPresent = false;
                restore(answers[i]);
            }
        }
    }

    //Restores knowledge chart
    if (knowledgeChart) {
        restore(knowledgeChart);
    }

     //restores search results
    if (state !== "no_wiki_total" && searchResults) {
        for(var i = 0; i < searchResults.length; i++) {
            restore(searchResults[i]);
        }
        logEntry.numWikiLinksRemoved = 0;
    }

    if(twitterBox) {
        logEntry.twitterRemoved = false;
        restore(twitterBox);
    }
}

//creates the mutation observer that hides wiki related DOM objects
observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {
    console.log(response);
    //Establish starttime
    logEntry.startTime = Date.now();

    //establish the listeners on the loggers
    if (document.readyState != 'loading'){
        initializeLoggingListeners();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLoggingListeners);
    }

    logEntry.userID = response.userID;
    logEntry.windowPixels = $(window).height() * $(window).width()
    var diff = Date.now() - response.startTime
    experimentInProgress = diff <= EXPERIMENT_DURATION;
    logEntry.numWikiLinksRemoved = 0;

    getLatestSessionInfo("search", logEntry.userID, function(sessionInfo) {
        logEntry.sessionID = sessionInfo.id; 

        // experimentInProgress = false;
        if(!experimentInProgress) {
            experimentCondition = "unchanged";
        } else {
            experimentCondition = sessionInfo.experimentCondition;
            logEntry.experimentCondition = experimentCondition;
        }

        //stops future modifications from being made if not supposed to modify
        if(experimentCondition === "unchanged") {
            observer.disconnect();
        }

        restoreModifications(experimentCondition);

        //Ensure that if the page is exited out of it is logged
        //uses beforeunload instead of unload to allow click event to occur
        window.addEventListener("beforeunload", function(evt) {
            queryEnd(evt);
        });

        
        //after a specified ammount of time, page is displayed to the user.
        setTimeout(function() {
            restorePage(observer);
            console.log(logEntry);
        }, PAGE_DELAY);
    });

});

