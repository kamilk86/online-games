var currentUser = getCookieValue("games_username");

function openRegister() {
    document.getElementById("register-form").style.display = "flex";
};

function closeRegister() {
    document.getElementById("register-form").style.display = "none";
};

function updateUserView() {

    userInfo = document.getElementById("user-info");
    loggedCont = document.getElementById("logged-container");
    loginCont = document.getElementById("login-container");

    if (currentUser != null) {
        userInfo.innerHTML = "Hello, " + currentUser;
        loggedCont.style.display = "flex";
        loginCont.style.display = "none";
    } else {
        userInfo.innerHTML = ""
        loggedCont.style.display = "none";
        loginCont.style.display = "flex";
    }

};

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : null;
}


$(document).ready(function () {
    $('#login-form').on('submit', function (e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var url = form.attr('action');

        $.ajax({
            type: "POST",
            url: url,
            data: form.serialize(), // serializes the form's elements.
            success: function (data) {
                document.cookie = "games_username=" + data.username + "; path=/;"
                document.cookie = "games_user_token=" + data.token + "; path=/;"
                currentUser = data.username;
                updateUserView();
                form[0].reset();
            }
        });
        return false;

    });
});

$(document).ready(function () {
    $('#logout-btn').on('click', function (e) {

        var url = window.location.origin + "/api/logout";
        var token = getCookieValue("games_user_token");

        $.ajax({
            type: "GET",
            url: url,
            headers: { "Authorization": "Token " + token },
            success: function (data) {

                document.cookie = "games_username=none; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                document.cookie = "games_user_token=none; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                currentUser = null;
                updateUserView();
            }
        });
    });
});
