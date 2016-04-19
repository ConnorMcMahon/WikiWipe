const SERVER = "https://wikiwipe.grouplens.org"
document.addEventListener('DOMContentLoaded', documentEvents  , false);

function myAction(input) { 
    chrome.storage.sync.get('userid', function(items){
        userID = items.userid;
        console.log(userID);
        console.log(input.value);
        jQuery.ajax({
            type: "POST",
            url: SERVER + "/deleteUserId",
            data: {
                password: input.value,
                id: userID
            },
            success: function(data) {
                console.log(data);
                chrome.storage.sync.remove('userid');
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            }
        })
    });
}

function documentEvents() {   
    document.getElementById('ok_btn').addEventListener('click', 
        function() { myAction(document.getElementById('name_textbox'));
    });
}