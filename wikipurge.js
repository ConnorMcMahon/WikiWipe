var elemParent = document.body

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes && (mutation.addedNodes.length > 0)) {
            var knowledgeBoxRemoved = false;
            
            //locates any node with the magic class name as a knowledge box
            var knowledgeBoxes = document.getElementsByClassName("g mnr-c rhsvw kno-kp g-blk");
            
            if (knowledgeBoxes) {
                for(var i = 0; i < knowledgeBoxes.length; i++){
                    knowledgeBoxes[i].style.setProperty('display', 'none', 'important');
                    //console.log("hid element");
                }
                knowledgeBoxRemoved = true;
            }

            if (knowledgeBoxRemoved) {
                //The below line makes more efficient, but stops subsequent searches from blocking
                //observer.disconnect();

                //TODO: add some logging features here
            }
        }
    });
});



observer.observe(elemParent, {
    childList: true,
    subtree: true
});

