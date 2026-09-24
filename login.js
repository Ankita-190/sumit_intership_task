let loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let email =
        document.getElementById("email").value.trim();

    let password =
        document.getElementById("password").value;


    // Users localStorage se lao
    let users =
        JSON.parse(localStorage.getItem("users")) || [];


    // Email aur password match karo
    let user = users.find(function(existingUser) {

        return existingUser.email === email &&
               existingUser.password === password;

    });


    if (user) {

        // Current user save karo
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        alert("Login Successful!");

        window.location.href = "menu.html";

    } else {

        alert("Invalid Email or Password!");

    }

});