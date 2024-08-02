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

//offerings icons as per the availability
const offerings = document.querySelectorAll(".offerings-container div table tr td");
const offeringList = [
    "Kitchen facilities",
    "Living room",
    "Fridge",
    "Balcony or patio",
    "Heating",
    "Air conditioning",
    "High-speed internet",
    "Cable TV",
    "Washer and dryer",
    "Closet space",
    "Parking availability",
    "Elevator access",
    "Security system",
    "Pet-friendly",
    "Garden view",
    "Lake view",
    "Dining table",
    "Mountain view",
    "Ocean view",
    "Proximity to public transportation",
    "Gym or fitness center",
    "Swimming pool",
    "Nearby shopping and dining options",
    "Quiet neighborhood",
    "Smoke-free environment",
    "Recycling facilities",
    "Maintenance services",
    "24-hour emergency contact"
]

offerings.forEach(offering => {
    switch (offering.innerHTML) {
        case "Kitchen facilities":
            offering.innerHTML = `<i class="fa-solid fa-kitchen-set me-3"></i></tr><tr>Kitchen facilities`;
            break;
        case "Living room":
            offering.innerHTML = `<i class="fa-solid fa-couch me-3"></i></tr><tr>Living room`;
            break;
        case "Fridge":
            offering.innerHTML = `<i class="fa-solid fa-toilet-portable me-3"></i></tr><tr>Fridge`;
            break;
        case "Balcony or patio":
            offering.innerHTML = `<i class="fa-solid fa-xmarks-lines me-3"></i></tr><tr>Balcony or patio`;
            break;
        case "Heating":
            offering.innerHTML = `<i class="fa-solid fa-hot-tub-person me-3"></i></tr><tr>Heating`;
            break;
        case "Air conditioning":
            offering.innerHTML = `<i class="fa-solid fa-wind me-3"></i></tr><tr>Air conditioning`;
            break;
        case "High-speed internet":
            offering.innerHTML = `<i class="fa-solid fa-wifi me-3"></i></tr><tr>High-speed internet`;
            break;
        case "Cable TV":
            offering.innerHTML = `<i class="fa-solid fa-tv me-3"></i></tr><tr>Cable TV`;
            break;
        case "Washer and dryer":
            offering.innerHTML = `<i class="fa-solid fa-soap me-3"></i></tr><tr>Washer and dryer`;
            break;
        case "Closet space":
            offering.innerHTML = `<i class="fa-solid fa-shirt me-3"></i></tr><tr>Closet space`;
            break;
        case "Parking availability":
            offering.innerHTML = `<i class="fa-solid fa-car-rear me-3"></i></tr><tr>Parking availability`;
            break;
        case "Elevator access":
            offering.innerHTML = `<i class="fa-solid fa-elevator me-3"></i></tr><tr>Elevator access`;
            break;
        case "Security system":
            offering.innerHTML = `<i class="fa-solid fa-elevator me-3"></i></tr><tr>Security system`;
            break;
        case "Pet-friendly":
            offering.innerHTML = `<i class="fa-solid fa-paw me-3"></i></tr><tr>Pet-friendly`;
            break;
        case "Garden view":
            offering.innerHTML = `<i class="fa-solid fa-tree me-3"></i></tr><tr>Garden view`;
            break;
        case "Lake view":
            offering.innerHTML = `<i class="fa-solid fa-water me-3"></i></tr><tr>Lake view`;
            break;
        case "Dining table":
            offering.innerHTML = `<i class="fa-solid fa-chair me-3"></i></tr><tr>Lake view`;
            break;
        case "Mountain view":
            offering.innerHTML = `<i class="fa-solid fa-mountain me-3"></i></tr><tr>Mountain view`;
            break;
        case "Ocean view":
            offering.innerHTML = `<i class="fa-solid fa-water me-3"></i></tr><tr>Ocean view`;
            break;
        case "Proximity to public transportation":
            offering.innerHTML = `<i class="fa-solid fa-truck-plane me-3"></i></tr><tr>Proximity to public transportation`;
            break;
        case "Gym or fitness center":
            offering.innerHTML = `<i class="fa-solid fa-dumbbell me-3"></i></tr><tr>Gym or fitness center`;
            break;
        case "Swimming pool":
            offering.innerHTML = `<i class="fa-solid fa-person-swimming me-3"></i></tr><tr>Swimming pool`;
            break;
        case "Nearby shopping and dining options":
            offering.innerHTML = `<i class="fa-solid fa-basket-shopping me-3"></i></tr><tr>Nearby shopping and dining options`;
            break;
        case "Quiet neighborhood":
            offering.innerHTML = `<i class="fa-regular fa-bell-slash me-3"></i></tr><tr>Quiet neighborhood`;
            break;
        case "Smoke-free environment":
            offering.innerHTML = `<i class="fa-solid fa-ban-smoking me-3"></i></tr><tr>Smoke-free environment`;
            break;
        case "Recycling facilities":
            offering.innerHTML = `<i class="fa-solid fa-recycle me-3"></i></tr><tr>Recycling facilities`;
            break;
        case "Maintenance services":
            offering.innerHTML = `<i class="fa-solid fa-screwdriver-wrench me-3"></i></tr><tr>Maintenance services`;
            break;
        case "24-hour emergency contact":
            offering.innerHTML = `<i class="fa-solid fa-truck-medical me-3"></i></tr><td>24-hour emergency contact`;
            break;
    };
})


//show description and show amenities

const showMoreBtn = document.querySelector(".show-more-btn");
const descriptionContainer = document.querySelector(".description-popup");
const descriptionCloseBtn = document.querySelector(".close-btn.dsc-close-btn");

if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
        showDescriptionContainer();
    });

    descriptionCloseBtn.addEventListener("click", () => {
        closeDescriptionContainer();
    });
}

function showDescriptionContainer() {
    document.querySelector(".desc-container").style.display = "flex";
    document.querySelector(".description-popup").style.display = "block";
}
function closeDescriptionContainer() {
    document.querySelector(".desc-container").style.display = "none";
    document.querySelector(".description-popup").style.display = "none";
}