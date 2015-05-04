$(function() {
    console.log(JSON.stringify(sessionStorage));
    
    if(sessionStorage.getItem('username')) {
        showMenuAndWelcome();
    } else {
        showAnyAndHideOther("welcomeForm");
    }
    
    numberTable();
    
    $("#toHome").on("click", function() {
        showMenuAndWelcome();
    });
    
    $("#logout").on("click", function() {
        sessionStorage.removeItem('objectId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('sessionToken');
        sessionStorage.removeItem('fullName');
        
        showAnyAndHideOther("welcomeForm");
    });
    
    $("#toPhonebook").on("click", function() {
        showMenuAndAny("phones");
        
        numberTable();
    });
    
    $("#editPhone").on("click", function() {
        EditNumber(); 
    });

    $("#backToPhonebook").on("click", function() {
        showMenuAndAny("phones");
        
        numberTable();
    });
    $("#toAddPhone").on("click", function() {
        showMenuAndAny("add-phone-form");
    });
    
    $(".toLogin").on("click", function() {
        showAnyAndHideOther("login-form");
    });
    
     $(".toRegister").on("click", function() {
        showAnyAndHideOther("register-form");
    });
    
    $("#addPhone").click(function() {
        var num = $("#addPhoneNumber").val(),
            name = $("#addPersonName").val(),
            data ={
                person: name,
                number: num,
                userId: sessionStorage.getItem("objectId")
            };
        
        addNumber(data);
        
        $("#addPhoneNumber").val("");
        $("#addPersonName").val("");
        
        showMenuAndAny("phones");
    });
});

var url = "https://api.parse.com/1/";
var resourceUrl = "https://api.parse.com/1/classes/Phone";
var editVariableId;

function showAnyAndHideOther(id) {
    $(".parent").each(function() {
           if($(this).attr("id") !== id) {
               $(this).removeClass("show").addClass("hide");
           } else {
               $(this).removeClass("hide").addClass("show");
           }
        });
}

function showMenuAndAny(id) {
    $(".parent").each(function() {
        if($(this).attr("id") !== id && $(this).attr("id") !== "menu") {
            $(this).removeClass("show").addClass("hide");
        } else {
            $(this).removeClass("hide").addClass("show");
        }
     });
}

function showMenuAndWelcome() {
    showMenuAndAny("welcome");
    
    $("#welcomeMessage").remove();
    
    var $welcomeString = $("<h1 id='welcomeMessage'>Welcome " + sessionStorage.getItem("fullName") +
                        "(" + sessionStorage.getItem("username") + ")</h1>");
    
    $("#welcome").prepend($welcomeString);
}

function login() {
    var success = function(data) {
        sessionStorage.removeItem('objectId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('sessionToken');
        sessionStorage.removeItem('fullName');
        
        sessionStorage.setItem('objectId', data['objectId']);
        sessionStorage.setItem('username', data['username']);
        sessionStorage.setItem('sessionToken', data['sessionToken']);
        sessionStorage.setItem('fullName', data['fullName']);
        
        showMenuAndWelcome();
        
        showInfoMessage("Login Successful");
    };
    
    var error = function() {
        showInfoMessage("Invalid login");
    };
    
    var username = $("#loginUsername").val(),
        password = $("#loginPassword").val();

        $("#loginUsername").val("");
        $("#loginPassword").val("");

    var data = {
        username: username, 
        password: password};

    ajaxRequester.get(url + "login", data, success, error);
}

function registration() {
    var username = $("#username").val(),
        password = $("#password").val(),
        fullName = $("#fullName").val();
        
        $("#username").val("");
        $("#password").val("");
        $("#fullName").val("");
    
    var success = function(data) {
        $("#loginUsername").val(username);
        $("#loginPassword").val(password);
        
        login();
    };
    
    var error = function() {
        showInfoMessage("Invalid register");
    };
    
    var data = JSON.stringify({
        username: username, 
        password: password,
        fullName: fullName});
        
    ajaxRequester.post(url + "users", data, success, error);
}

function showInfoMessage(msg) {
        noty({
                text: msg,
                type: 'info',
                layout: 'topCenter',
                timeout: 5000}
        );
    }
    
function numberTable() {
    var success = function(data) {
                $("tr.number").remove();
            //alert(JSON.stringify(data));
                for (var q in data.results) {
                        var contact = data.results[q];
                        var number = contact.number,
                            person = contact.person,
                            userId = contact.userId,
                            numberId =contact.objectId,
                            sessionId = sessionStorage.getItem("objectId");
                            
                    if(userId === sessionId) {
                        $("#phones").append("<tr class='number' id='" + numberId + "'></tr>");
                        $('table#phones tr:last')
                            .append("<td clas='thisPerson'>"+ person + "</td>" +
                                    "<td clas='thisNumber'>"+ number + "</td>" +
                                    "<td><a href='#' class='edit link'>Edit</a>\n\
                                        <a href='#' class='delete link'>Delete</a>\n\
                                    </td>");
                    }
                        
                }
                
            $(".edit").click(function() {
                var $parent = $(this).parent().parent(".number");
                
                    editVariableId = $(this).parent().parent(".number").attr("id");
                    
                    $("#editPersonName").val($parent.children("td")[0].innerHTML);
                    $("#editPhoneNumber").val($parent.children("td")[1].textContent);
                    showMenuAndAny("edit-phone-form");
            });

            $(".delete").click(function() {
                    DeleteNumber($(this).parent().parent(".number").attr("id"));
            });
        };
        
        var error = function() {
          showInfoMessage("Wrong Phonebook");  
        };
    
    return ajaxRequester.get(resourceUrl , null, success, error);
};

function EditNumber() {
        var success = function (data) {
                            showMenuAndAny("phones");
                            
                            numberTable();
                            
                            showInfoMessage("Successful Editing");
                          };
        var data = {"person": $("#editPersonName").val(),"number": $("#editPhoneNumber").val()};
        data= JSON.stringify(data);
        
        var error= function() {
            showInfoMessage("Invalid Editing");
        };
        
        ajaxRequester.put(resourceUrl + '/' + editVariableId, data, success, error);
};

function addNumber(data) {
    var success = function (data) {
        $('tr.number').remove();
        numberTable();
        showInfoMessage("Success Adding");
      };
      
    var error = function() {
        showInfoMessage("Invalid Adding");
    };
    
    data= JSON.stringify(data);
    
    return ajaxRequester.post(resourceUrl, data, success, error);
  };
  
  function DeleteNumber(id) {
    var success = function (data) {
                $('tr.number').remove();
                numberTable();
                showInfoMessage("Success Delete");
              };
    var error = function() {
        showInfoMessage("Invalid Delete");
    };
    
    ajaxRequester.delete(resourceUrl + '/' + id, success, error);
}
    
    
