let registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let mobile = document.getElementById("mobile").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let terms = document.getElementById("terms").checked;

    if (name === "") {
        alert("Please enter your name");
        return;
    }

    if (email === "") {
        alert("Please enter your email");
        return;
    }

    if (mobile === "") {
        alert("Please enter your mobile number");
        return;
    }

    if (password === "") {
        alert("Please enter your password");
        return;
    }

    if (password !== confirmPassword) {
        alert("Password does not match");
        return;
    }

    if (!terms) {
        alert("Please accept Terms & Conditions");
        return;
    }

    // Save user data
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    alert("Registration Successful!");

    // Go to Login page
    window.location.href = "login.html";

});