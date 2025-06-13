function checkEmail(email) {
    var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function checkPassword(pwd) {
    var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return pwdRegex.test(pwd);
}

function su() {
    var form = document.f;
    var username = form.username.value.trim();
    var email = form.email.value.trim();
    var dob = form.db.value;
    var pwd = form.pwd.value;
    var confirmPwd = form['confirm-password'].value;

    var usernameInput = document.getElementById('username');
    var emailInput = document.getElementById('email');
    var dobInput = document.getElementById('db');
    var pwdInput = document.getElementById('password');
    var confirmPwdInput = document.getElementById('confirm-password');

    [usernameInput, emailInput, dobInput, pwdInput, confirmPwdInput].forEach(input => {
        input.style.border = '';
    });

    var usernameRegex = /^[a-zA-Z0-9]{5,12}$/;
    if (!usernameRegex.test(username)) {
        usernameInput.style.border = '2px solid red';
        alert("Username must be 5-12 characters long and contain only letters and numbers.");
        usernameInput.focus();
        return false;
    }

    if (!checkEmail(email)) {
        emailInput.style.border = '2px solid red';
        alert("Please enter a valid email address.");
        emailInput.focus();
        return false;
    }

    if (!dob) {
        dobInput.style.border = '2px solid red';
        alert("Please enter your date of birth.");
        dobInput.focus();
        return false;
    }

    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 8) {
        dobInput.style.border = '2px solid red';
        alert("You must be at least 8 years old to register.");
        dobInput.focus();
        return false;
    }

    if (!checkPassword(pwd)) {
        pwdInput.style.border = '2px solid red';
        alert("Password must be at least 8 characters long and include:\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character");
        pwdInput.focus();
        return false;
    }

    if (pwd !== confirmPwd) {
        confirmPwdInput.style.border = '2px solid red';
        pwdInput.style.border = '2px solid red';
        alert("Passwords do not match.");
        confirmPwdInput.focus();
        return false;
    }

    var submitBtn = document.getElementById('1b');
    var originalBtnText = submitBtn.value;
    submitBtn.value = "Creating account...";
    submitBtn.disabled = true;

    const dbRef = firebaseFunctions.ref(firebaseDatabase);

    firebaseFunctions.get(firebaseFunctions.child(dbRef, "Users"))
        .then((snapshot) => {
            let exists = false;
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    if (userData.username === username) {
                        exists = true;
                    }
                });
            }

            if (exists) {
                usernameInput.style.border = '2px solid red';
                alert("Username already exists. Please choose another one.");
                usernameInput.focus();
                submitBtn.value = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            return firebaseFunctions.createUserWithEmailAndPassword(firebaseAuth, email, pwd)
                .then((userCredential) => {
                    const user = userCredential.user;

                    return firebaseFunctions.set(firebaseFunctions.ref(firebaseDatabase, 'Users/' + user.uid), {
                        username: username,
                        email: email,
                        date_of_birth: dob
                    }).then(() => {
                        return firebaseFunctions.sendEmailVerification(user);
                    });
                })
                .then(() => {
                    alert("Account created successfully! Please check your email for verification.");
                    form.reset();
                    setTimeout(() => {
                        window.location.href = "../HTML/site.html";
                    }, 1200);
                })
                .catch((error) => {
                    let errorMessage = "Registration failed: ";
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = "This email is already registered. Please use a different email or try logging in.";
                            emailInput.style.border = '2px solid red';
                            emailInput.focus();
                            break;
                        case 'auth/invalid-email':
                            errorMessage = "The email address is invalid. Please enter a valid email.";
                            emailInput.style.border = '2px solid red';
                            emailInput.focus();
                            break;
                        case 'auth/weak-password':
                            errorMessage = "Password is too weak. It should be at least 6 characters.";
                            pwdInput.style.border = '2px solid red';
                            pwdInput.focus();
                            break;
                        case 'auth/operation-not-allowed':
                            errorMessage = "Email/password accounts are not enabled. Contact support.";
                            break;
                        default:
                            errorMessage += error.message;
                    }
                    alert(errorMessage);
                })
                .finally(() => {
                    submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                });
        })
        .catch((error) => {
            alert("An error occurred while checking username availability: " + error.message);
            submitBtn.value = originalBtnText;
            submitBtn.disabled = false;
        });

    return false;
}
