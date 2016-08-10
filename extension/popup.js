const SERVER = "https://wikiwipe.grouplens.org"
document.addEventListener('DOMContentLoaded', documentEvents  , false);

function Withdraw(input) { 
    chrome.storage.local.get('userid', function(items){
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
                chrome.storage.local.remove('userid');
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            }
        })
    });
}

function Enroll(input) { 
    chrome.storage.local.get('userid', function(items){
        userID = items.userid;
        if(!userID){
            jQuery.ajax({
                type: "POST",
                data: {passcode: input.value },
                url: SERVER + "/getNewUserID",
                success: function(data) {
                    userID = parseInt(data);
                    chrome.storage.local.set({userid: input.value});
                    alert(data +"\nPlease wait 5 seconds before searching!");
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) { 
                    alert("Status: " + textStatus); alert("Error: " + errorThrown); 
                }
            });
        }
    });
}

function documentEvents() {   
    document.getElementById('enroll_btn').addEventListener('click', 
        function() { Enroll(document.getElementById('name_textbox'));
    });
}