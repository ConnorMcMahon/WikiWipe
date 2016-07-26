const ELEMENT_PARENT = document.body;
const PAGE_DELAY = 1000*.3;
const EXPERIMENT_DURATION = 1000 * 60 * 30; //milliseconds in 30 minutes

//Asset based constants
const KNOWLEDGE_BOX_CLASS = 'g mnr-c rhsvw g-blk';
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
var removedLinks = [];

//Set to remove all by default
var experimentCondition = "all";
var experimentInProgress = true;
var reloadAllowed = true;

var alreadyLogged =false;

var sizes = {};

var hide = function(element) {
    element.style.setProperty('display', 'none');
}
//hide the main page first
// hide(document.getElementById(GOOGLE_BODY));

var restore = function(element) {
    element.style.setProperty('display', 'block');
}

var include = function(arr,obj) {
    return (arr.indexOf(obj) !== -1);
}

var hideKnowledgeBox = function(knowledgeBox) { 
    if(experimentCondition === "unchanged" || experimentCondition === "links") {
        return;
    }

    if(experimentCondition === "all" || experimentCondition === "all_assets" || experimentCondition === "links+assets"){
        hide(knowledgeBox);
    }

    var textSection = knowledgeBox.getElementsByClassName(KNOWLEDGE_TEXT_CLASS)[0];
    var classification = knowledgeBox.getElementsByClassName(CLASSIFICATION_CLASS)[0];
    var description = textSection.getElementsByClassName(KNOWLEDGE_DESC_CLASS)[0];
    var facts = textSection.getElementsByClassName(KNOWLEDGE_FACTS);
    var categories = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS),0);
    var categories2 = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS2),0);
    var categoriesCombined = categories.concat(categories2);

    if(description && description.childNodes.length > 1) {
        logEntry.descriptionPresent = true;
        hide(description);
    }

    if(classification){
        logEntry.classificationPresent = true;
        hide(classification);
    }

    if(facts) {
        logEntry.factsPresent = true;
        for(var i = 0; i < facts.length; i++){
            try {
                var factLabel = facts[i].getElementsByClassName("fl")[0].innerHTML;
                if(!include(NON_WIKI_FACTS, factLabel)){
                    hide(facts[i]);
                }
            } catch(e) {}
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
                    hide(categoriesCombined[i]);
                }
            }
        }
    }
}

var restoreKnowledgeBox = function(knowledgeBox){
    if(experimentCondition === "all" || experimentCondition == "all_assets") {
        return;
    } else if (experimentCondition === "assets" || experimentCondition === "links+assets") {
        restore(knowledgeBox);
        return;
    }
    var textSection = knowledgeBox.getElementsByClassName(KNOWLEDGE_TEXT_CLASS)[0];
        var classification = knowledgeBox.getElementsByClassName(CLASSIFICATION_CLASS)[0];

    var description = textSection.getElementsByClassName(KNOWLEDGE_DESC_CLASS)[0];
    var facts = textSection.getElementsByClassName(KNOWLEDGE_FACTS);
    var categories = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS),0);
    var categories2 = Array.prototype.slice.call(knowledgeBox.getElementsByClassName(CATEGORY_CLASS2),0);
    var categoriesCombined = categories.concat(categories2);

    if(description && description.childNodes.length > 1) {
        restore(description);
    }

    if(classification){
        restore(classification);
    }

    if(facts){
        for(var i =0; i < facts.length; i++){
            try {
                var factLabel = facts[i].getElementsByClassName("fl")[0].innerHTML;
                restore(facts[i]);
            } catch (e) {}
        } 
    }

    if(categoriesCombined){
        for (var i = 0 ; i < categoriesCombined.length; i++) {
            try {
                var headings = categoriesCombined[i].getElementsByClassName(HEADING_CLASS);
                if (headings[0]) {
                    var heading = headings[0].childNodes[0].innerHTML;
                    if(heading && heading.innerHTML){
                        heading = heading.innerHTML.innerHTML
                    }
                    if (include(PROBABLY_WIKI_CATEGORIES, heading) || include(POSSIBLY_WIKI_CATEGORIES, heading)) {
                        restore(categoriesCombined[i]);
                    }
                }
            } catch(e) {
                restore(categoriesCombined[i]);
            }
        }
    }

    restore(knowledgeBox);
}


//Removes WikiRelated DOM elements
var removeDOMElements = function() {
    if(experimentCondition === "unchanged"){
        return;
    }
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var knowledgeChart = document.getElementById(KNOWLEDGE_TABLE_ID);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    var twitterBox = document.getElementsByTagName(TWITTER_TAG)[0];
    var scoresBox = document.getElementsByClassName(SCORES_CLASS)[0];
    var locationBox = document.getElementsByClassName(LOCATION_CLASS)[0];
    var extraWikiLinks = document.getElementsByClassName(EXTRA_WIKI_LINK_CLASS)[0];

    var removeAssets = experimentCondition === "assets" || experimentCondition === "all" || experimentCondition === "assets_all" || experimentCondition === "links+assets";
    var removeLinks = experimentCondition === "all" || experimentCondition === "links" || experimentCondition === "links+assets";
    
    if (knowledgeBoxes && removeAssets) {    
        for(var i = 0; i < knowledgeBoxes.length; i++){
            //check if the "knowledge box" is actually aknowledge box or a "see results box"
            if (knowledgeBoxes[i].getElementsByClassName(SEE_RESULTS_CLASS).length > 0){
                logEntry.seeResultsAboutPresent = true;
                if (experimentCondition === "all"){
                    hide(knowledgeBoxes[i]);
                }
            } else {
                logEntry.knowledgeBoxPresent = true;
                hideKnowledgeBox(knowledgeBoxes[i]);
            }   
        }       
    }

    if (answers && removeAssets) {
        for(var i = 0; i < answers.length; i++){
            var targetElement = answers[i].childNodes[0];
            var isAnswerBox = (targetElement.getAttribute("class") == ANSWER_BOX_CLASS);
            var isQABox = answers[i].getElementsByClassName(QA_BOX_CLASS).length > 0;
            var isContextAnswer = (targetElement.getAttribute("class") == CONTEXT_ANSWER_CLASS);

            if (isAnswerBox) {
                logEntry.answerBoxPresent = true;
                //Find the source in the html
                var isSourced = (answers[i].childNodes[1].childNodes.length > 1) || (answers[i].getElementsByClassName("rc").length > 0);
                //hides the answer box if it is from WikiData
                if (!isSourced) {
                    hide(answers[i]);
                }
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
                            hide(questions[j]);
                        }
                    }
                }
                hide(answers[i]);
            } else if (isContextAnswer) {
                logEntry.contextAnswerBoxPresent = true;
                var hyperLink = answers[i].getElementsByClassName("r")[0].childNodes[0];
                var isWikiLink = WIKI_REGEX.test(hyperLink.getAttribute('href'));
                if (isWikiLink) {
                    hide(answers[i]);
                }
            }
        }
    }

    if (knowledgeChart && removeAssets){
        logEntry.knowledgeChartPresent = true;
        hide(knowledgeChart);
    }

    if (searchResults && removeLinks) {
        for(var i = 0; i < searchResults.length; i++){

            //finds the link of the search result
            var linkName = searchResults[i].childNodes[0].childNodes[0].href
            
            //determines if link is from wikipedia using regex
            var isWikiLink = WIKI_REGEX.test(linkName);

            var id = searchResults[i].getAttribute("data-hveid");
            if (isWikiLink){
                logEntry.wikiLinks = true;
            }

            //hides the link if it is from wikipedia
            if (isWikiLink && removedLinks.indexOf(id) === -1 ){
                hide(searchResults[i]);
                removedLinks.push(id);
                logEntry.numWikiLinks += 1;           
            }
         }
    }

    if (extraWikiLinks && removeLinks) {
        hide(extraWikiLinks);
    }

    //only in all and assets_all conditions are the below assets removed
    if(experimentCondition !== "all" && experimentCondition !== "assets_all"){
        return;
    }

    if(twitterBox) {
        logEntry.extraAssetPresent = true;
        if(experimentCondition === "all"){
            hide(twitterBox);
        }
    }

    if(scoresBox) {
        logEntry.extraAssetPresent = true;
        if(experimentCondition === "all"){
            hide(scoresBox);
        }
    }

    if(locationBox) {
        logEntry.extraAssetPresent = true;
        if(experimentCondition === "all"){
            hide(locationBox);
        }
    }
}

var restoreModifications = function(state) {
    if (state === "all"){
        return;
    }
    
    //locates any potential dom elements to remove
    var knowledgeBoxes = document.getElementsByClassName(KNOWLEDGE_BOX_CLASS);
    var answers = document.getElementsByClassName(ANSWERS_CLASS);
    var knowledgeChart = document.getElementById(KNOWLEDGE_TABLE_ID);
    var searchResults = document.getElementsByClassName(SEARCH_RESULTS_CLASS);
    var twitterBox = document.getElementsByTagName(TWITTER_TAG)[0];
    var scoresBox = document.getElementsByClassName(SCORES_CLASS)[0];
    var locationBox = document.getElementsByClassName(LOCATION_CLASS)[0];
    var extraWikiLinks = document.getElementsByClassName(EXTRA_WIKI_LINK_CLASS)[0];
    
    var restoreAssets = experimentCondition === "unchanged" || experimentCondition === "links";
    var restoreLinks = experimentCondition === "unchanged" || experimentCondition == "assets";

    //restores knowledge boxes
    if (knowledgeBoxes) {
        for(var i = 0; i < knowledgeBoxes.length; i++) {
            if (knowledgeBoxes[i].getElementsByClassName(SEE_RESULTS_CLASS).length > 0){
                restore(knowledgeBoxes[i]);
            } else {
                restoreKnowledgeBox(knowledgeBoxes[i]);
            }
        }
    }

    //restores answer boxes and also QA Boxes
    if (answers) {        
        for(var i = 0; i < answers.length; i++) {
            var targetElement = answers[i].childNodes[0];
            var isAnswerBox = (targetElement.getAttribute("class") === ANSWER_BOX_CLASS);
            var isQABox = (targetElement.getAttribute("class") === QA_BOX_CLASS);
            var isContextAnswer = (targetElement.getAttribute("class") === CONTEXT_ANSWER_CLASS);

            if (isAnswerBox && restoreAssets) {
                restore(answers[i]);
            } else if (restoreAssets) {
                var questions = targetElement.getElementsByClassName("related-question-pair");
                for(var j = 0; j < questions.length; j++){
                    restore(questions[j]);
                }
                restore(answers[i]);
            } else if (restoreAssets){
                restore(answers[i]);
            }
        }
    }

    if (extraWikiLinks && restoreLinks){
        restore(extraWikiLinks);
    }

    //Restores knowledge chart
    if (knowledgeChart && restoreAssets) {
        restore(knowledgeChart);
    }

     //restores search results
    if (restoreLinks && searchResults) {
        for(var i = 0; i < searchResults.length; i++) {
            restore(searchResults[i]);
        }
        logEntry.numWikiLinks = 0;
    }

    //everything else gets restored in all conditions but "all" or "all assets"
    if(experimentCondition === "all_assets"){
        return;
    }

    if(twitterBox) {
        restore(twitterBox);
    }

    if(scoresBox) { 
        restore(scoresBox);
    }

    if(locationBox) {
        restore(locationBox);
    }

    var picture = document.getElementsByClassName("PICTURE_CLASS");
    if(picture){
        for(var i = 0; i < picture.length; i++){
            restore(picture[i]);
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
            logEntry.body = document.getElementById("rcnt").innerHTML;
            updateServer("search", logEntry);

        } catch(e) {
            console.log(e);
        }
        //creates the mutation observer that hides wiki related DOM objects
        observer.observe(ELEMENT_PARENT, {
            childList: true,
            subtree: true
        });
    }
}

//Finds all entities that could indicate a new search query after page loads
var initializeLoggingListeners = function(){
    //place logging handlers on things that indicate a new search
    var searchBox = document.getElementById(SEARCH_BOX_ID);
    var voiceSearch = document.getElementById(VOICE_SEARCH_ID);
    var suggestedQuery = document.getElementsByClassName(DID_YOU_MEAN_CLASS)[1];
    var originalQuery = document.getElementsByClassName(ORIG_SPELLING_CLASS)[1];
    
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
            logEntry.clickedItem = element.outerHTML;
            logEntry.linkRank = index + 1;
            logEntry.linkURL = element.childNodes[0].getAttribute("data-href");
            queryEnd(evt);
        });
    });
};

//Displays the body and stops any removals from occuring
var restorePage = function() {
    //keeps attempting to restore body every .1 sec until successful
    var interval = setInterval(function(){
        body = document.getElementById(GOOGLE_BODY);
        restore(body);
        if (body){
            body.style.setProperty('visibility', 'visible');
            clearInterval(interval);
        }
    }, 100);  
}

//creates the mutation observer that hides wiki related DOM objects
observer.observe(ELEMENT_PARENT, {
    childList: true,
    subtree: true
});

var blockReload = function(){
    reloadAllowed = false;
}

var clearLogging = function() {
    window.onbeforeunload = null;
}

//Get the value of whether the script is running
chrome.extension.sendMessage({ cmd: "getUserInfo" }, function (response) {
    //Establish starttime
    logEntry.startTime = Date.now();
    console.log(response.userID);

    //establish the listeners on the loggers
    if (document.readyState != 'loading'){
        initializeLoggingListeners();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLoggingListeners);
    }

    //If experiment not in progress then restore and return
    var diff = Date.now() - response.startTime;
    experimentInProgress = diff <= EXPERIMENT_DURATION;

    logEntry.userID = response.userID;
    if(!logEntry.userID || !experimentInProgress){
        restorePage();
        clearLogging();
        return;
    }
    logEntry.numWikiLinks = 0;

    getLatestSessionInfo("search", logEntry.userID, function(sessionInfo) {
        try {
            logEntry.sessionID = sessionInfo.id;
            // if(logEntry.sessionID > 1){
            //     throw "Only wanted one session";
            // }

            experimentCondition = sessionInfo.experimentCondition;
            logEntry.experimentCondition = experimentCondition;

            experimentCondition = "assets";

            //stops future modifications from being made if not supposed to modify
            if(experimentCondition === "unchanged") {
                observer.disconnect();
            }

            restoreModifications(experimentCondition);

            //Ensure that if the page is exited out of it is logged
            //uses beforeunload instead of unload to allow click event to occur
            window.addEventListener("beforeunload", function(evt) {
                blockReload();
                queryEnd(evt);
            });
           
            console.log(experimentCondition);
            //after a specified ammount of time, page is displayed to the user.
            setTimeout(function() {
                restorePage();
                var reload = function() {
                    location.reload();
                }

                var currentHash = window.location.hash

                setInterval(function(){
                    if (!currentHash){
                        currentHash = window.location.hash;
                    } else if(currentHash !== window.location.hash && reloadAllowed){
                        location.reload();
                    }
                }, 100);
            }, PAGE_DELAY);
        } 
        catch(e) {
            observer.disconnect();
            experimentCondition = "unchanged";
            restorePage();
            clearLogging();
            console.log(e);
            return;
        }
    });
});



