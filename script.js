document.getElementById("registerForm").addEventListener("submit", function(event) {

    event.preventDefault();


    // ===============================
    // GET FORM VALUES
    // ===============================

    let name =
        document.getElementById("name").value.trim();

    let email =
        document.getElementById("email").value.trim();

    let mobile =
        document.getElementById("mobile").value.trim();

    let password =
        document.getElementById("password").value;

    let confirmPassword =
        document.getElementById("confirmPassword").value;


    // ===============================
    // PASSWORD CHECK
    // ===============================

    if (password !== confirmPassword) {

        alert("Password and Confirm Password do not match!");

        return;
    }


    // ===============================
    // TERMS CHECK
    // ===============================

    let terms =
        document.getElementById("terms").checked;

    if (!terms) {

        alert("Please agree to Terms & Conditions!");

        return;
    }


    // ===============================
    // GENDER CHECK
    // ===============================

    let genderElement =
        document.querySelector(
            'input[name="gender"]:checked'
        );

    if (!genderElement) {

        alert("Please select your gender!");

        return;
    }


    // ===============================
    // USER OBJECT
    // ===============================

    let user = {

        name: name,

        email: email,

        mobile: mobile,

        password: password,

        gender: genderElement.value

    };


    // ===============================
    // GET EXISTING USERS
    // ===============================

    let users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];


    // ===============================
    // CHECK DUPLICATE EMAIL
    // ===============================

    let existingUser =
        users.find(function(existingUser) {

            return existingUser.email.toLowerCase() ===
                   user.email.toLowerCase();

        });


    if (existingUser) {

        alert("This email is already registered!");

        return;
    }


    // ===============================
    // ADD NEW USER
    // ===============================

    users.push(user);


    // ===============================
    // SAVE USERS
    // ===============================

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );


    // ===============================
    // SUCCESS
    // ===============================

    alert("Registration Successful!");


    // Login page
    window.location.href = "login.html";

});