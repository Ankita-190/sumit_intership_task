let adminLoginForm =
    document.getElementById("adminLoginForm");


adminLoginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let email =
        document.getElementById("adminEmail").value.trim();

    let password =
        document.getElementById("adminPassword").value;


    // Admin credentials
    let adminEmail = "admin@gmail.com";
    let adminPassword = "admin123";


    if (
        email === adminEmail &&
        password === adminPassword
    ) {

        // Admin login status save karo
        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );

       // alert("Admin Login Successful!");

        window.location.href = "admin.html";

    } else {

        alert("Invalid Admin Email or Password!");

    }

});