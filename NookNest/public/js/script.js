// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

//disabling right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
}, false)


// Custom styling for alert(Vanish automatization after 5 seconds)
const alertElement = document.querySelector(".alert.alert-dismissible");

if (alertElement) {
    // Set a timeout function
    setTimeout(function () {
        // Fade out the alert element
        alertElement.style.transition = "opacity 0.5s";
        alertElement.style.opacity = 0;

        // Remove the alert element after fade out
        setTimeout(function () {
            alertElement.parentNode.removeChild(alertElement);
        }, 500); // Wait for the fade out transition to complete (500ms)
    }, 5000); // Show the alert for 5000ms (5 seconds)
}

// Function to handle closing the alert
function closeAlert(button) {
    const alert = button.closest('.alert');
    alert.parentNode.removeChild(alert);
}

// login and Sign up form view when clicked on button
const loginBtns = document.querySelectorAll(".login-btn");
const signupBtns = document.querySelectorAll(".signup-btn");
const closeBtns = document.querySelectorAll(".login-signup-container .close-btn");

loginBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        closeSignupForm();
        showLoginForm();
    });
});

signupBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        closeLoginForm();
        showSignupForm();
    });
});

if (closeBtns) {
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeLoginForm();
            closeSignupForm();
        });
    });
}


function showLoginSignupContainer() {
    document.querySelector(".login-signup-container").style.display = "flex";
    if (bookingPopup) {
        bookingPopup.style.display = "none";
    }
}
function closeLoginSignupContainer() {
    document.querySelector(".login-signup-container").style.display = "none";
}

function showLoginForm() {
    showLoginSignupContainer();
    document.querySelector(".login-form").style.display = "flex";
}
function showSignupForm() {
    showLoginSignupContainer();
    document.querySelector(".signup-form").style.display = "flex";
}
function closeLoginForm() {
    closeLoginSignupContainer();
    document.querySelector(".login-form").style.display = "none";
}
function closeSignupForm() {
    closeLoginSignupContainer();
    document.querySelector(".signup-form").style.display = "none";
}


// Show and hide booking confirmation popup 
const reserveButton = document.getElementById('reserve_button');
const bookingPopup = document.querySelector('.booking-overlay');
const bookingCloseBtn = document.querySelector(".booking-confirmation-close-btn");

if (reserveButton) {
    reserveButton.addEventListener("click", () => {
        bookingPopup.style.display = "block";
    })
}

if (bookingCloseBtn) {
    bookingCloseBtn.addEventListener("click", () => {
        bookingPopup.style.display = "none";
    })
}