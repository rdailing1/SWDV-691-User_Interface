
/*
    Global arrays
*/
var arrParentManagerDDL = [""];
var arrCESDDL = [""];
var arrOtherDDL = [""];
var arrGroups = [];
var dropDowns = {
    Group1Dropdown : 'Group1Dropdown',
    Group2Dropdown : 'Group2Dropdown',
    Group3Dropdown : 'Group3Dropdown'
};
var arrWL = [];


/*
    Initialize the login page
*/
function initLogin() {
    // Show the page (it acts like a tab, following the theme)
    document.getElementById('Login').style.display = "block";
    document.getElementById("userEmail").focus();
}


/*
    Initialize the "GEO" page
*/
function initGEO() {
    var obj;
    var select;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            // Populate the Group dropdown lists
            for (var i = 0; i < obj.recordset.length; i++) {
                for (dropDown in dropDowns) {
                    select = document.getElementById(dropDown);
                    select.options[select.options.length] = new Option(obj.recordset[i].Group);
                }

                arrGroups.push(obj.recordset[i].Group);
            }

            populateShadowBoxes();
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/group/" + sessionStorage.getItem("loginName"), false);
    
    xmlhttp.send();

    getUserData();
    
    // Show the Admin button, only for me
    if (sessionStorage.getItem("loginName") == "rldail@earthlink.net"){
        document.getElementById("AdminButton").style.display = 'block';
    }

    // Set the text and button state on the Partner page
    if (arrParentManagerDDL.length == 1) {
        document.getElementById('partnerLbl').innerText = "You must complete your profile to continue (and be sure to click \"Update\").";
        document.getElementById('profileLbl').innerText = "There are uncategorized names in this group.";
        document.getElementById('profileLbl').style.display = "block";
        document.getElementById('PartnerPick').disabled = true;
    }

    // Show the landing page
    document.getElementById('Home').style.display = "block";
    // Skip the landing page (comment the above and uncomment the below)
    // document.getElementById('ProfileButton').click();
}


/*
    Determine if the user's profile is complete, which allows the partner algorithm to work
*/
function partnerReady(){
    if (arrParentManagerDDL.length == 1 && arrCESDDL.length == 1 && arrOtherDDL.length == 1) {
        return true;
    }
    else {
        return false;
    }
}


/*
    Clear and repopulate the relationship lists and wishlists
*/
function populateShadowBoxes() {
    // Clear the lists
    var uls = [myUL1, myUL2, myUL3, myUL4, myUL5];
    uls.forEach(function(item) {
        while(item.firstChild){
            item.removeChild(item.firstChild);
        }
    });

    // Populate the relationship lists
    relationshipPopulate();

    // Populate the My Wishlist list
    wishlistPopulate();
}


/*
    Keep the Group dropdown lists equal across tabs
*/
function dropdownSwitch(original) {
    // Clear the relationship arrays
    arrParentManagerDDL = [""];
    arrCESDDL = [""];
    arrOtherDDL = [""];

    // Clear the relationship dropdown lists
    document.getElementById('ParentManagerDDL').innerText = null
    document.getElementById('CESDDL').innerText = null
    document.getElementById('OtherDDL').innerText = null

    // Get the value to be used across ddls
    var selectedIndex = document.getElementById(original).options.selectedIndex == -1 ? 1 : document.getElementById(original).options.selectedIndex;

    // Set the selected value for each ddl
    for (dropDown in dropDowns) {
        if (dropDown != original) {
            document.getElementById(dropDown).options.selectedIndex = selectedIndex;
        }
    }

    populateShadowBoxes();

    // Populate the relationship lists
    relationshipPopulate();
}


/*
    Populate the given dropdown list
*/
function ddlPopulate(arr, ddl) {
    while (ddl.options.length > 0) {                
        ddl.remove(0);
    }

    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            var option = document.createElement("OPTION");

            option.innerHTML = arr[i];
            option.innerText = arr[i];

            ddl.options.add(option);
        }
    }
}


/*
    Populate the relationship lists
*/
function relationshipPopulate() {
    var ddl = document.getElementById("Group1Dropdown");
    var group = ddl.selectedIndex == -1 ? arrGroups[0] : ddl.options[ddl.selectedIndex].value;
    var obj;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            // Add the name to the correct list or to the ddl if no list selected yet
            if (obj.recordset.length > 0) {
                for (var i = 0; i < obj.recordset.length; i++) {
                    var related = obj.recordset[i].Related;
                    if (related == "") continue;

                    switch(obj.recordset[i].Relationship) {
                        case 'Parent-Manager':
                            newElement("myInput1", false, related);
                            break;
                        case 'Child-Employee-Spouse':
                            newElement("myInput2", false, related);
                            break;
                        case 'Sibling-Peer-Other':
                            newElement("myInput3", false, related);
                            break;
                        default:
                            if (!arrParentManagerDDL.includes(related)) {
                                arrParentManagerDDL.push(related);
                                ddlPopulate(arrParentManagerDDL, ParentManagerDDL);
                            }
                            if (!arrCESDDL.includes(related)) {
                                arrCESDDL.push(related);
                                ddlPopulate(arrCESDDL, CESDDL);
                            }
                            if (!arrOtherDDL.includes(related)) {
                                arrOtherDDL.push(related);
                                ddlPopulate(arrOtherDDL, OtherDDL);
                            }
                    }
                }

                // Set the text and button state on the Profile and Partner pages
                textSet();
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/relate/" + sessionStorage.getItem("loginName") + "/\'" + group + '\'', false);

    xmlhttp.send();
}


/*
    Populate the wishlists
*/
function wishlistPopulate() {
    var ddl = document.getElementById("Group1Dropdown");
    var group = ddl.selectedIndex == -1 ? arrGroups[0] : ddl.options[ddl.selectedIndex].value;
    var obj;
    var xmlhttp = new XMLHttpRequest();
    
    // Clear the array
    arrWL = [];

    // Clear the list
    while(myUL4.firstChild) myUL4.removeChild(myUL4.firstChild);

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            if (obj.recordset.length > 0) {
                for (var i = 0; i < obj.recordset.length; i++) {
                    newElement("myInput4", false, obj.recordset[i].Item);
                    arrWL.push(obj.recordset[i].Item);
                }
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/mywl/" + sessionStorage.getItem("loginName") + "/\'" + group + '\'', false);
    
    xmlhttp.send();
}


/*
    Create a new list item element
*/
function newElement(myInput, fromWeb, inputValue) {
    var myUL = myInput === 'myInput1' ? 'myUL1' : myInput === 'myInput2' ? 'myUL2' : myInput === 'myInput3' ? 'myUL3' : 'myUL4';

    inputValue = myInput == 'myInput4' && fromWeb ? document.getElementById('myInput4').value : inputValue;

    // Verify the input data isn't already in the list
    var ulItems = document.getElementById(myUL).getElementsByTagName("li");
    for (var i = 0; i < ulItems.length; ++i) {
        if (ulItems[i].innerText == inputValue) {
            if (fromWeb) alert("Cannot insert duplicate values!");
            document.getElementById(myInput).value = "";
            return;
        }
    }

    var li = document.createElement("li");
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (fromWeb && inputValue === '') {
        alert("You must type something!");
    } else {
        document.getElementById(myUL).appendChild(li);
    }
    if (myInput == 'myInput4') document.getElementById(myInput).value = "";
}


/*
    Update the user's profile
*/
function profileUpdate() {
    var ulItems;

    // Check each unordered list for "checked" items and move them to the arrays
    var lists = ['myUL1', 'myUL2', 'myUL3'];
    lists.forEach(function(item) {
        ulItems = document.getElementById(item).getElementsByTagName("li");
        if (ulItems.length > 0) {
            for (var i = 0; i < ulItems.length; i++) {
                var element = ulItems[i];
                if (element.innerText == "") continue;

                var classes = element.className.split(" ");

                if (classes.indexOf("checked") >= 0) {
                    var selected = element.innerText;

                    if (!arrParentManagerDDL.includes(selected)) arrParentManagerDDL.push(selected);
                    if (!arrCESDDL.includes(selected)) arrCESDDL.push(selected);
                    if (!arrOtherDDL.includes(selected)) arrOtherDDL.push(selected);

                    // Remove the list item and decrement the counter to account for the smaller list
                    element.remove();
                    i--;
                }
            }
        }
    });

    // Check each array for items in the ddls and remove them from the arrays (has to be done after the above)
    var arrays = [arrParentManagerDDL, arrCESDDL, arrOtherDDL];
    lists.forEach(function(item) {
        ulItems = document.getElementById(item).getElementsByTagName("li");
        if (ulItems.length > 0) {
            for (var i = 0; i < ulItems.length; i++) {
                var element = ulItems[i];
                if (element.innerText == "") continue;

                arrays.forEach(function(arr) {
                    if (arr.length > 0) {
                        if (arr.includes(element.innerText)) {
                            for (var x = 0; x < arr.length; x++){
                                if (arr[x] == element.innerText) {
                                    arr.splice(x, 1);
                                }
                            }
                        }
                    }
                });
            }
        }
    });
    
    // Set the text and button state on the Profile and Partner pages
    textSet();

    // Repopulate the dropdown lists
    ddlPopulate(arrParentManagerDDL, ParentManagerDDL);
    ddlPopulate(arrCESDDL, CESDDL);
    ddlPopulate(arrOtherDDL, OtherDDL);

    namePWDUpdate();
}


/*
    Update the name and password in the UserProfile table
*/
function namePWDUpdate() {
    var arr1;
    var arr2;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            arr1 = response.split(":[");
            arr2 = arr1[2].split("]");
            if (arr2[0] == "0") {
                document.getElementById('profileLbl').innerText = "The changes were not saved.  Please try again.";
                document.getElementById('profileLbl').className = "error";
            }
        }
    };
    
    // Change the style so we can pick up the actual password
    document.getElementById('userPassword').style = "-webkit-text-security: none";

    xmlhttp.open("PUT", "http://localhost:8081/UserUpdate/" + sessionStorage.getItem("loginName") + "/" + document.getElementById('userName').innerText  + '/' + document.getElementById('userPassword').innerText, false);

    xmlhttp.send();

    // Change the style back
    document.getElementById('userPassword').style = "-webkit-text-security: disc";
}


/*
    Set the text and button state on the Profile and Partner pages
*/
function textSet() {
    if (!partnerReady()) {
        document.getElementById('partnerLbl').innerText = "You must complete your profile to continue (and be sure to click \"Update\").";
        document.getElementById('profileLbl').innerText = "There are uncategorized names in this group.";
        document.getElementById('profileLbl').className = "error";
        document.getElementById('profileLbl').style.display = "block";
        document.getElementById('PartnerPick').disabled = true;
    }
    else {
        document.getElementById('partnerLbl').innerText = "";
        document.getElementById('profileLbl').innerText = "";
        document.getElementById('profileLbl').style.display = "none";
        document.getElementById('PartnerPick').disabled = false;
    }
}


/*
    Update the user's wishlist
*/
function WishlistUpdate() {
    var ul4Items = document.getElementById("myUL4").getElementsByTagName("li");
    var group = Group2Dropdown.selectedIndex == -1 ? arrGroups[0] : Group2Dropdown.options[Group2Dropdown.selectedIndex].value;
    var xmlhttp = new XMLHttpRequest();
    var arr = [];

    if (ul4Items.length > 0) {
        // Update the unordered list
        for (var i = 0; i < ul4Items.length; i++) {
            var element = ul4Items[i];
            var classes = element.className.split(" ");
    
            if (classes.indexOf("checked") >= 0) {
                arr.push(element.innerText);

                // Remove the item from the wishlist array
                arrWL.forEach(function(item) {
                    if (item.includes(element.innerText)) {
                        for (var i = 0; i < item.length; i++){
                            if (item[i] == element.innerText) {
                                item.splice(i, 1);
                            }
                        }
                    }
                });

                // Remove the list item
                element.remove();
                i--;
            }
        }
    }

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            arr1 = response.split(":[");
            arr2 = arr1[2].split("]");
            if (arr2[0] == "0") {
                document.getElementById('wlLbl').innerText = "The changes were not saved.  Please try again.";
                document.getElementById('wlLbl').className = "error";
                document.getElementById('wlLbl').style.display = "block";
            }
            else {
                document.getElementById('wlLbl').innerText = "";
                document.getElementById('wlLbl').style.display = "none";
            }
        }
    };
    
    // Remove items from the wishlist for this user/group (if required)
    if (arr.length > 0) {
        arr.forEach(function(item) {
            xmlhttp.open("POST", "http://localhost:8081/wlDelete/" + sessionStorage.getItem("loginName") + "/\'" + group + "\'/" + item, false);
            xmlhttp.send();
        });
    }

    // Add the items in the unordered list to the wishlist table for this user/group (if required)
    for (var i = 0; i < ul4Items.length; i++) {
        if (arrWL.length == 0 || !arrWL.includes(ul4Items[i].innerText)) {
            xmlhttp.open("POST", "http://localhost:8081/wlInsert/" + sessionStorage.getItem("loginName") + "/\'" + group + "\'/\'" + ul4Items[i].innerText + "\'", false);
            xmlhttp.send();
        }
    }
}


/*
    Handle relationship dropdown list item selection
*/
function selectionAdd(ddl, arr) {
    var myDDL = document.getElementById(ddl);
    var list = myDDL.childNodes;

    document.getElementById('profileLbl').innerText = "There are unsaved changes on this tab.";
    document.getElementById('profileLbl').className = "warning";

    // Get the value (innerHTML) of the selected item
    var selected = list[myDDL.selectedIndex].innerHTML;

    // Remove the selected item from the relationship arrays
    var arrays = ['arrParentManagerDDL', 'arrCESDDL', 'arrOtherDDL'];
    arrays.forEach(function(item) {
        if (item.includes(selected)) {
            for (var i = 0; i < item.length; i++){
                if (item[i] == selected) {
                    item.splice(i, 1);
                }
            }
        }
    });

    // Remove the selected item from the relationship dropdown lists
    var relationships = ['ParentManagerDDL', 'CESDDL', 'OtherDDL'];
    relationships.forEach(function(item) {
        var element = document.getElementById(item);
        for (var x = 0; x < element.options.length; x++) {
            if (element.options[x].innerText == selected) {
                element.remove(x);
            }
        }
    });

    // Create the new list item from the selected item
    var myInput = ddl == 'ParentManagerDDL' ? 'myInput1' : ddl == 'CESDDL' ? 'myInput2' : 'myInput3';
    newElement(myInput, true, selected);
}


/*
    Handle navigation (tab) clicks
*/
function openLink(evt, id) {
    var i, x, tablinks;

    // Hide all tabs
    document.getElementById('Home').style.display = "none";
    x = document.getElementsByClassName("choice");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }

    // Show the selected tab
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-black", "");
    }
    document.getElementById(id).style.display = "block";
    evt.currentTarget.className += " w3-black";
}


/*
    Handle logins
*/
function login() {
    var userEmail = document.getElementById("userEmail").value;
    var userPassword = document.getElementById("loginPassword").value
    var emailCheck = document.getElementById("userEmail").value.indexOf("@");

    sessionStorage.setItem("loginName", userEmail);

    if (emailCheck == -1 & userPassword.length == 0) {
        alert("Please complete the form.");
        return(false);
    }

    if (emailCheck == -1) {
        alert("Please enter a valid E-mail address.");
        return(false);
    }

    if (userPassword.length == 0) {
        alert("Please enter a password.");
        return(false);
    }

    var obj;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            if (obj.recordset.length == 1) {
                window.open('./geo.html', '_self');
            }
            else {
                alert("Incorrect E-mail / Password combination!");
                return(false);
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/UserLogin/" + userEmail + "/" + userPassword, false);
    
    xmlhttp.send();
}


/*
    Pull and populate user profile data
*/
function getUserData() {
    var obj;
    var xmlhttp = new XMLHttpRequest();

    try {
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = xmlhttp.responseText;

                obj = JSON.parse(response);

                if (obj.recordset.length > 0) {
                    document.getElementById("userName").innerText = obj.recordset[0].Name;
                    document.getElementById("userPassword").innerText = obj.recordset[0].Password;
                }
            }
        };
        xmlhttp.open("GET", "http://localhost:8081/UserData/" + sessionStorage.getItem("loginName"), false);
        
        xmlhttp.send(); 
    }
    catch(err) {
        alert(err.message)
    }
}


/*
    Handle button clicks and presses
*/
function handleBtnClick(event) {
    handleEvent(event);
}

function handleBtnKeyPress(event) {
    // Check to see if space or enter were pressed
    if (event.key === " " || event.key === "Enter") {
        // Prevent the default action to stop scrolling when space is pressed
        event.preventDefault();
        handleEvent(event);
    }
}

function handleEvent(event) {
    if (event.target.id == 'ProfileCancel') {
        getUserData();
        populateShadowBoxes();
    }
    else if (event.target.id == 'ProfileUpdate') {
        profileUpdate();
    }
    else if (event.target.id == 'WishlistCancel') {
        wishlistPopulate();
    }
    else if (event.target.id == 'WishlistUpdate') {
        WishlistUpdate();
    }
    else if (event.target.id == 'LoginButton') {
        login();
    }
}
