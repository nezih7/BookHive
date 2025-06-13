
// Function to validate email format
function checkEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Function to validate password format
function checkPassword(pwd) {
    var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return pwdRegex.test(pwd);
}

// Function to authenticate login
function su() {
    const email = document.f.em.value.trim();
    const pwd = document.f.pwd.value.trim();
    const emailInput = document.getElementById('email');
    const pwdInput = document.getElementById('password');

    // Email validation
    if (!checkEmail(email)) {
        alert("Please enter a valid email address.");
        emailInput.style.border = '2px solid red';
        return false;
    } else {
        emailInput.style.border = '';
    }

    // Password validation
    if (!checkPassword(pwd)) {
        alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
        pwdInput.style.border = '2px solid red';
        return false;
    } else {
        pwdInput.style.border = '';
    }

    // Firebase Authentication sign-in
    window.signInWithEmailAndPassword(window.auth, email, pwd)
        .then((userCredential) => {
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
                alert("Please verify your email address before logging in.");
                emailInput.style.border = '2px solid red';
                window.auth.signOut(); // Log out the user if email isn't verified
                return;
            }

            // Proceed with Realtime Database check (if still needed)
            const userRef = window.ref(window.db, 'Users');
            window.get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const users = snapshot.val();
                        let validUser = false;

                        for (let userId in users) {
                            const dbUser = users[userId];
                            if (dbUser.email === email) { 
                                validUser = true;
                                break;
                            }
                        }

                        if (validUser) {
                            console.log("Login successful!");
                            setTimeout(() => {
                                window.location.href = "Library.html";
                            }, 1000); // Redirect to dashboard
                        } else {
                            alert("User not found in database.");
                            emailInput.style.border = '2px solid red';
                            pwdInput.style.border = '2px solid red';
                        }
                    } else {
                        alert("No users found in the database.");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data: ", error);
                    alert("An error occurred while checking the database. Please try again later.");
                });
        })
        .catch((error) => {
            console.error("Authentication error: ", error);
            if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                alert("Invalid email or password. Please try again.");
            } else {
                alert("Invalid email or password. Please try again.");
            }
            emailInput.style.border = '2px solid red';
            pwdInput.style.border = '2px solid red';
        });
}

// BookBridge >20
document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        var form = document.forms["search"];
        var input = form.elements["research"];
        var searchIcon = document.getElementsByClassName("search-icon")[0];

        // Real-time validation for red border
        input.oninput = function () {
            if (this.value.length > 0 && this.value.length <= 20) {
                this.style.border = "2px solid red";
            } else {
                this.style.border = "";
            }
        };

        // Unified validation logic
        function validateInput(event) {
            if (input.value.length <= 20) {
                event.preventDefault();
                alert("Error: Research field must contain more than 20 characters.");
                input.focus();
                return false;
            }
            return true;
        }

        // Intercept form submit (e.g., via Enter key)
        form.onsubmit = function (event) {
            return validateInput(event);
        };

        // Search icon click
        searchIcon.onclick = function (event) {
            if (validateInput(event)) {
                // Optional delay before submission
                setTimeout(() => {
                    form.submit();
                }, 1000);
            }
        };
    }
};
