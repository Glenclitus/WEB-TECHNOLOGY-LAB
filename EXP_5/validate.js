// Form Validation for Online Art Supplies Store - EXP_5

// 1. Reusable validator functions
function isEmpty(value) {
    return value.trim() === "";
}

function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
}

function isStrongPassword(pw) {
    return pw.length >= 8;
}

// 2. Helper functions to display and clear errors
function showError(id, message) {
    const errorElement = document.getElementById(id);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.className = "error-message show";
    }
}

function showSuccess(id, message = "Looks good") {
    const errorElement = document.getElementById(id);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.className = "success-message show";
    }
}

function clearErrors() {
    const errorSpans = document.querySelectorAll("#signupForm span[id$='Error']");
    errorSpans.forEach(span => {
        span.textContent = "";
        span.className = "";
    });
}

// 3. Main validation function combining checks with if / else
function validateForm() {
    let valid = true;
    clearErrors();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const passVal = passwordInput.value;

    // Name Validation
    if (nameVal === "") {
        showError("nameError", "Name is required");
        valid = false;
    } else if (nameVal.length < 3) {
        showError("nameError", "Use at least 3 characters");
        valid = false;
    } else {
        showSuccess("nameError", "Looks good");
    }

    // Email Validation
    if (isEmpty(emailVal)) {
        showError("emailError", "Email is required");
        valid = false;
    } else if (!isValidEmail(emailVal)) {
        showError("emailError", "Enter a valid email (e.g. user@example.com)");
        valid = false;
    } else {
        showSuccess("emailError", "Looks good");
    }

    // Password Validation
    if (isEmpty(passVal)) {
        showError("passError", "Password is required");
        valid = false;
    } else if (!isStrongPassword(passVal)) {
        showError("passError", "Minimum 8 characters");
        valid = false;
    } else {
        showSuccess("passError", "Looks good");
    }

    return valid;
}

// 4. Attach submit event listener with preventDefault()
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            if (!validateForm()) {
                e.preventDefault(); // Stay on page and show errors
            } else {
                e.preventDefault(); // Prevent full page reload to show success message clearly
                alert("Signup successful! Welcome to Online Art Supplies Store.");
                form.reset();
                clearErrors();
            }
        });
    }
});

