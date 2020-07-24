
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
                select = document.getElementById("Group1Dropdown");
                select.options[select.options.length] = new Option(obj.recordset[i].Group);

                select = document.getElementById("Group2Dropdown");
                select.options[select.options.length] = new Option(obj.recordset[i].Group);
    
                select = document.getElementById("Group3Dropdown");
                select.options[select.options.length] = new Option(obj.recordset[i].Group);
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/group/" + sessionStorage.getItem("loginName") , true);
    
    xmlhttp.send();

    getUserData();

    // Show the landing page
    document.getElementById('Home').style.display = "block";

    // Skip the landing page (comment the above and uncomment the below)
    // document.getElementById('ProfileButton').click();
    
    // Show the Admin button, only for me
    if (sessionStorage.getItem("loginName") == "rldail@earthlink.net"){
        document.getElementById("AdminButton").style.display = 'block';
    }
}


/*
    Keep the Group dropdown lists equal across tabs
*/
function dropdownSwitch(original) {
    var dropDowns = {
        Group1Dropdown : 'Group1Dropdown',
        Group2Dropdown : 'Group2Dropdown',
        Group3Dropdown : 'Group3Dropdown'
    };

    var selectedIndex = document.getElementById(original).options.selectedIndex;
    for(dropDown in dropDowns) {
        if (dropDown != original) {
            document.getElementById(dropDown).options.selectedIndex = selectedIndex;
        }
    }

    populateCards();
}


/*
    Clear and populate the lists
*/
function populateCards() {
    // Clear the lists
    var uls = [myUL1, myUL2, myUL3, myUL4, myUL5];
    uls.forEach(function(item) {
        while( item.firstChild ){
            item.removeChild(item.firstChild);
        }
    });

    // Populate My Wishlist card
    wishlistPopulate();

    // Populate the relationship cards
    relationshipPopulate();
}

/*
    Populate the wishlist cards
*/
function wishlistPopulate() {
    var ddl = document.getElementById("Group1Dropdown");
    var group = ddl.selectedIndex == -1 ? "" : ddl.options[ddl.selectedIndex].value;
    var obj;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            if (obj.recordset.length > 0) {
                for (var i = 0; i < obj.recordset.length; i++) {
                    newElement("myInput4", false, obj.recordset[i].Item);
                }
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/mywl/" + sessionStorage.getItem("loginName") + "/\'" + group + '\'', true);
    
    xmlhttp.send();
}


/*
    Populate the relationship cards
*/
function relationshipPopulate() {
    var ddl = document.getElementById("Group1Dropdown");
    var group = ddl.selectedIndex == -1 ? "" : ddl.options[ddl.selectedIndex].value;
    var obj;
    var xmlhttp = new XMLHttpRequest();
    var parentManager = ["Father", "Mother", "Manager", "Supervisor"];
    var childEmployee = ["Daughter", "Wife", "Son", "Husband"];

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = xmlhttp.responseText;

            obj = JSON.parse(response);

            if (obj.recordset.length > 0) {
                for (var i = 0; i < obj.recordset.length; i++) {
                    if (parentManager.includes(obj.recordset[i].Relationship)) {
                        newElement("myInput1", false, obj.recordset[i].Related);
                    }
                    else if (childEmployee.includes(obj.recordset[i].Relationship)) {
                        newElement("myInput2", false, obj.recordset[i].Related);
                    }
                    else {
                        newElement("myInput3", false, obj.recordset[i].Related);
                    }
                }
            }
        }
    };
    xmlhttp.open("GET", "http://localhost:8081/relate/" + sessionStorage.getItem("loginName") + "/\'" + group + '\'', true);

    xmlhttp.send();
}


/*
    Handle navigation (tab) clicks
*/
function openLink(evt, animName) {
    var i, x, tablinks;
    document.getElementById('Home').style.display = "none";
    x = document.getElementsByClassName("choice");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-black", "");
    }
    document.getElementById(animName).style.display = "block";
    evt.currentTarget.className += " w3-black";

    populateCards();
}


/*
    Create a new list item element
*/
function newElement(myInput, fromWeb, inputValue) {
    var myUL = myInput === 'myInput1' ? 'myUL1' : myInput === 'myInput2' ? 'myUL2' : myInput === 'myInput3' ? 'myUL3' : 'myUL4';

    if (fromWeb) {
        inputValue = document.getElementById(myInput).value;
    }

    // Verify the input data isn't already in the list
    var ulItems = document.getElementById(myUL).getElementsByTagName("li");
    for (var i = 0; i < ulItems.length; ++i) {
        if (ulItems[i].innerText == inputValue) {
            alert("Cannot insert duplicate values!");
            document.getElementById(myInput).value = "";
            return;
        }
    }

    var li = document.createElement("li");
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
      alert("You must type something!");
    } else {
      document.getElementById(myUL).appendChild(li);
    }
    document.getElementById(myInput).value = "";
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
    xmlhttp.open("GET", "http://localhost:8081/UserLogin/" + userEmail + "/" + userPassword, true);
    
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
        xmlhttp.open("GET", "http://localhost:8081/UserData/" + sessionStorage.getItem("loginName"), true);
        
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
    toggleButton(event.target);
}

function handleBtnKeyPress(event) {
    // Check to see if space or enter were pressed
    if (event.key === " " || event.key === "Enter") {
        // Prevent the default action to stop scrolling when space is pressed
        event.preventDefault();
        toggleButton(event.target);
    }
}

function toggleButton(element) {
    handleEvent(event);
}

function handleEvent(event) {
    if (event.target.id == 'ProfileCancel') {
        location.reload();
    }
    else if (event.target.id == 'ProfileUpdate') {
        profileUpdate();
    }
    else if (event.target.id == 'WishlistCancel') {
        location.reload();
        // document.getElementById('WishlistButton').click();
    }
    else if (event.target.id == 'WishlistUpdate') {
        WishlistUpdate();
    }
    else if (event.target.id == 'LoginButton') {
        login();
    }
}

function profileUpdate() {
    var ul1Items = document.getElementById("myUL1").getElementsByTagName("li");
    var ul2Items = document.getElementById("myUL2").getElementsByTagName("li");
    var ul3Items = document.getElementById("myUL3").getElementsByTagName("li");

    if (ul1Items.length > 0) {
        for (var i = 0; i < ul1Items.length; ++i) {
            var element = ul1Items[i];
            var classes = element.className.split(" ");

            if (classes.indexOf("checked") >= 0) {
                alert(ul1Items[i].innerText + " is checked.");
            }
            else {
                alert(ul1Items[i].innerText + " is unchecked.");
            }
        }
    }

    if (ul2Items.length > 0) {
        for (var i = 0; i < ul2Items.length; ++i) {
            var element = ul2Items[i];
            var classes = element.className.split(" ");
    
            if (classes.indexOf("checked") >= 0) {
                alert(ul2Items[i].innerText + " is checked.");
            }
            else {
                alert(ul2Items[i].innerText + " is unchecked.");
            }
        }
    }

    if (ul3Items.length > 0) {
        for (var i = 0; i < ul3Items.length; ++i) {
            var element = ul3Items[i];
            var classes = element.className.split(" ");
    
            if (classes.indexOf("checked") >= 0) {
                alert(ul3Items[i].innerText + " is checked.");
            }
            else {
                alert(ul3Items[i].innerText + " is unchecked.");
            }
        }
    }
}


function WishlistUpdate() {
    var ul4Items = document.getElementById("myUL4").getElementsByTagName("li");

    if (ul4Items.length > 0) {
        for (var i = 0; i < ul4Items.length; ++i) {
            var element = ul4Items[i];
            var classes = element.className.split(" ");
    
            if (classes.indexOf("checked") >= 0) {
                alert(ul4Items[i].innerText + " is checked.");
            }
            else {
                alert(ul4Items[i].innerText + " is unchecked.");
            }
        }
    }
}
