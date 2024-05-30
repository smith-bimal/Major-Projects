const navOptions = document.querySelectorAll(".nav-option");
const subNavOptions = document.querySelectorAll(".nav-child a p");

// Close the sub-menus if clicked outside
document.addEventListener("click", (e) => {

    if (!e.target.closest(".nav-option") && !e.target.closest(".sub-nav")) {
        closeSubNav();
        document.querySelectorAll(".sub-nav").forEach(sub => sub.classList.remove("sub-nav-active"));
    }
});
// Function to set the active state of the navigation options based on the current URL
function setActiveNav() {
    const currentUrl = window.location.pathname;

    // for main nav options
    navOptions.forEach((el) => {
        if (el.parentElement.tagName === 'A') {
            let href = el.parentElement.getAttribute('href');

            if (currentUrl === href) {
                el.classList.add('nav-active');
            } else {
                el.classList.remove('nav-active');
            }
        }
    });

    // for sub-nav options
    subNavOptions.forEach((el) => {

        switch (currentUrl) {
            case '/appointment/create':
                updateSubNav(el);
                break;
            case '/appointment/manage':
                updateSubNav(el);
                break;

            case '/pharmacy/add':
                updateSubNav(el);
                break;
            case '/pharmacy/manage':
                updateSubNav(el);
                break;

            case '/prescription/add':
                updateSubNav(el);
                break;
            case '/prescription/':
                updateSubNav(el);
                break;
            case '/prescription/manage':
                updateSubNav(el);
                break;

            case '/lab/tests':
                updateSubNav(el);
                break;
            case '/lab/results':
                updateSubNav(el);
                break;
            case '/patient/vitals':
                updateSubNav(el);
                break;
            case '/employee/vitals':
                updateSubNav(el);
                break;
            case '/lab/reports':
                updateSubNav(el);
                break;

            case '/doctor/add':
                updateSubNav(el);
                break;
            case '/doctor/':
                updateSubNav(el);
                break;
            case '/doctor/manage':
                updateSubNav(el);
                break;

            case '/patient/register':
                updateSubNav(el);
                break;
            case '/patient/':
                updateSubNav(el);
                break;
            case '/patient/manage':
                updateSubNav(el);
                break;
            case '/patient/discharge':
                updateSubNav(el);
                break;

            case '/employee/add':
                updateSubNav(el);
                break;
            case '/employee/':
                updateSubNav(el);
                break;
            case '/employee/manage':
                updateSubNav(el);
                break;

            case '/appointment/records':
                updateSubNav(el);
                break;
            case '/patient/records':
                updateSubNav(el);
                break;
            case '/prescription/records':
                updateSubNav(el);
                break;
            case '/lab/records':
                updateSubNav(el);
                break;

            case '/payroll/add':
                updateSubNav(el);
                break;
            case '/payroll/manage':
                updateSubNav(el);
                break;
            case '/payroll/generate':
                updateSubNav(el);
                break;

            default:
                updateSubNav(el);
                break;
        }
    });

    function updateSubNav(el) {
        let href = el.parentElement.getAttribute('href');

        if (currentUrl.includes(href)) {
            el.parentElement.parentElement.previousElementSibling.classList.add('nav-active');
            el.setAttribute('id', 'nav-link-active');
            el.parentElement.parentElement.classList.add("sub-menu-active");
            rotateIconDown(el.parentElement.parentElement.previousElementSibling);
        } else if (currentUrl.includes('payslip')) {
            let subNavLink = document.querySelector('a[href="/payroll/generate"]');
            subNavLink.firstElementChild.setAttribute('id', 'nav-link-active');
            subNavLink.parentElement.classList.add("sub-menu-active");
            subNavLink.parentElement.previousElementSibling.classList.add('nav-active');
        }
    }
}

// Call the function to set the active state initially
setActiveNav();

// Call the function whenever the page is loaded or the URL changes
window.addEventListener('DOMContentLoaded', setActiveNav);
window.addEventListener('popstate', setActiveNav);

// toggle the sub nav option when clicked
navOptions.forEach((el) => {
    el.addEventListener("click", (e) => {
        closeSubNav();
        if (el.nextElementSibling) {
            el.nextElementSibling.classList.add("sub-menu-active");
            rotateIconDown(el);
        }
    });
});



//Rotate the down arrow icon
function rotateIconDown(el) {
    el.lastElementChild.style.transform = "rotate(-180deg)";
}

//Rotate back all arrow icon
function rotateIconUp() {
    document.querySelectorAll(".fa-caret-down").forEach((icon) => {
        icon.style.transform = "rotate(0deg)";
    })
}

// close sub menu active state
function closeSubNav() {
    navOptions.forEach((el) => {
        if (el.nextElementSibling) {
            el.nextElementSibling.classList.remove("sub-menu-active");
            rotateIconUp(el)
        }
    })
}



//Check doctor status
const allDocStatus = document.querySelectorAll(".doc-status");

allDocStatus.forEach((status) => {
    if (status.innerHTML === "Online") {
        status.style.backgroundColor = "#1FBFC3";
    } else if (status.innerHTML === "Offline") {
        status.style.backgroundColor = "#FE686B";
    }
})

//Check Appointment status
const allAppStatus = document.querySelectorAll(".app-status");

allAppStatus.forEach((status) => {
    if (status.innerHTML === "Completed") {
        status.style.backgroundColor = "#1FBFC3";
    } else if (status.innerHTML === "Cancelled") {
        status.style.backgroundColor = "#FE686B";
    } else if (status.innerHTML === "Pending") {
        status.style.backgroundColor = "#FF891A";
    }
})

//Check Treatment Status
const allTreatmentStatus = document.querySelectorAll(".treatment-status");

allTreatmentStatus.forEach((status) => {
    if (status.innerHTML === "Ongoing") {
        status.style.backgroundColor = "#FF891A";
    } else if (status.innerHTML === "Completed") {
        status.style.backgroundColor = "#1FBFC3";
    }
})

// Three dot options and tasks
const optionDots = document.querySelectorAll("tr td i");

optionDots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the click event from propagating to the body
        removeExistingMenus();

        const appId = dot.getAttribute("data-id"); // Get the appointment ID from data attribute
        let dotOptionMenu = createDotMenu(appId);
        dot.parentElement.appendChild(dotOptionMenu);
        disableDotOption(dotOptionMenu);

        setupDeletePopup(appId); // Pass the appId to the deletePopup function
    })
});

function createDotMenu(appId) {
    let dotOptionMenu = document.createElement("div");
    dotOptionMenu.className = "dots-popup p-3 rounded-3 text-secondary position-absolute border bg-white top-50 end-0 translate-middle-y";
    dotOptionMenu.innerHTML = `
        <a href='${appId}' class='text-decoration-none lh-1'>
            <p class='update-btn text-secondary mb-4 mt-2'>Update</p>
        </a>
        <p class='delete-btn' data-id='${appId}'>Delete</p>
    `; // Add data-id to the delete button
    return dotOptionMenu;
}

function removeExistingMenus() {
    const existingMenus = document.querySelectorAll(".dots-popup");
    existingMenus.forEach((menu) => {
        menu.remove();
    });
}

function disableDotOption(dotMenu) {
    document.body.addEventListener("click", (e) => {
        if (!dotMenu.contains(e.target)) {
            dotMenu.remove();
            document.body.removeEventListener("click", disableDotOption);
        }
    });
}

// Popup when clicked on delete button
function setupDeletePopup(appId) {
    const deleteBtns = document.querySelectorAll(".delete-btn");

    let overlay = document.createElement("div");
    overlay.className = "overlay";

    let popup = document.createElement("div");
    popup.setAttribute("class", "popup-menu card bg-white rounded-3 p-0 text-center");
    popup.innerHTML = `
        <div class="card-content">
            <div class="card-header p-2">
                <h5 class="card-title m-2">Confirmation</h5>
            </div>
            <div class="card-body">
                <p class="m-2">Are you sure to delete?</p>
            </div>
            <div class="card-footer p-3">
                <button type="button" class="btn btn-outline-danger me-2" id="confirm-delete">
                    Delete
                </button>
                <button type="button" class="btn btn-outline-secondary ms-2" id="cancel">
                    Close
                </button>
            </div>
        </div>
    `;

    deleteBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector(".main").appendChild(overlay);
            document.querySelector(".main").appendChild(popup);

            document.querySelector("#cancel").addEventListener("click", () => {
                popup.remove();
                overlay.remove();
            });

            document.querySelector("#confirm-delete").addEventListener("click", () => {
                fetch(`/delete/${appId}`, {
                    method: 'DELETE',
                }).then(response => {
                    if (response.ok) {
                        // Optionally, remove the deleted item from the DOM
                        document.querySelector(`tr[data-id='${appId}']`).remove();
                    }
                    popup.remove();
                    overlay.remove();
                });
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    optionDots.forEach((dot) => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent the click event from propagating to the body
            removeExistingMenus();

            const appId = dot.getAttribute("data-id"); // Get the appointment ID from data attribute
            let dotOptionMenu = createDotMenu(appId);
            dot.parentElement.appendChild(dotOptionMenu);
            disableDotOption(dotOptionMenu);

            setupDeletePopup(appId); // Pass the appId to the deletePopup function
        });
    });
});


// notification panel toggle for all webpages

const notificationBtn = document.querySelector(".notification");
let notificationDiv = document.createElement("div");
notificationDiv.setAttribute("class", "notification-panel p-4 bg-white border rounded-2 d-flex align-items-center justify-content-center");
notificationDiv.innerHTML = `<div class="close-noti rounded-circle d-flex align-items-center justify-content-center">X</div><p>No new notification.</p>`;

notificationBtn.addEventListener("click", () => {
    document.body.appendChild(notificationDiv);
    notificationDiv.style.transform = "scale(1)";
});

document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("close-noti")) {
        notificationDiv.style.transform = "scale(0)";
        notificationDiv.remove();
    }
});


//Logout popup when clicked on username
const usernameBtn = document.querySelector(".username");

let logout = document.createElement("div");
logout.setAttribute("class", "logout p-3 rounded-3 bg-white border");
logout.innerHTML = "Logout&nbsp;&nbsp;<i class='fa-solid fa-right-from-bracket'></i>";

let isLogoutVisible = false;

usernameBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Stop the click event from propagating to the document body
    if (!isLogoutVisible) {
        document.body.appendChild(logout);
        isLogoutVisible = true;
        usernameBtn.nextElementSibling.style.transform = "rotate(180deg)";
    }
});

document.body.addEventListener("click", (e) => {
    if (isLogoutVisible && !e.target.classList.contains("logout") && !e.target.closest(".logout")) {
        logout.remove();
        isLogoutVisible = false;
        usernameBtn.nextElementSibling.style.transform = "rotate(0deg)";
    }
});


//Copyright 
const main = document.querySelector(".main");
const copyright = document.createElement("p");
copyright.setAttribute("class", "copyright text-secondary pt-0 pb-0 m-0");
copyright.innerHTML = "&copy; 2024 Smith Bimal. All rights reserved.";
main.appendChild(copyright);



//Responsive navbar when screen size smaller than 768px

if (window.innerWidth < 768) {
    const navMenuBtn = document.querySelector(".nav-hamburger");

    navMenuBtn.addEventListener("click", () => {
        console.log("button is clicked");
        document.querySelector(".navigation").classList.toggle("slide-in");
    })

    // Close the nav menus if clicked outside
    document.addEventListener("click", (e) => {

        if (!e.target.closest(".navigation") && !e.target.closest(".nav-option")) {
            closeSubNav();
            document.querySelector(".navigation").classList.remove("slide-in");
        }
    });
}

//Show success popup according to the status code of the request

try {
    (function ($) {
        function showSwal(type, message = '') {
            if (type === 'success-message') {
                swal({
                    title: 'Congratulations!',
                    text: message || 'The information got stored successfully.',
                    icon: 'success',
                    type: 'success',
                    button: {
                        text: "Continue",
                        value: true,
                        visible: true,
                        className: "btn btn-primary"
                    }
                });
            } else if (type === 'error-message') {
                swal({
                    title: 'Error occurred!',
                    text: message || 'There was a problem with the submission.',
                    icon: 'error',
                    type: 'error',
                    button: {
                        text: "Retry",
                        value: true,
                        visible: true,
                        className: "btn btn-danger"
                    }
                });
            }
        }

        // Array of form IDs
        var formIds = [
            'create_app',
            'add_pharma',
            'new_patient_presc',
            'new_lab_test',
            'new_lab_result',
            'new_pat_vital',
            'add_doc_form',
            'add_emp_form',
            'pat_reg_form',
            'pat_discharge_form',
            'manage_emp_pay_form',
            'new_emp_pay',
            'update_app_form',
            'update_doc_form',
            'update_emp_form',
            'update_pharma_form',
            'update_patient_presc',
            'update_pat_form',
            'doc_acc_profile'
        ];

        // Loop through each form ID and attach the event listener
        formIds.forEach(function (formId) {
            let formElement = document.getElementById(formId);
            if (formElement) {
                formElement.addEventListener('submit', function (event) {
                    // Prevent the default form submission behavior
                    // event.preventDefault();

                    // const formData = new FormData(this);
                    // const requestData = {};

                    // // Convert form data to JSON
                    // formData.forEach(function (value, key) {
                    //     requestData[key] = value;
                    // });

                    // // Send data to server
                    // fetch('/insertData', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify(requestData)
                    // })
                    // .then(response => response.json())
                    // .then(data => {
                    //     if (data.success) {
                    // showSwal('success-message', data.message);
                    showSwal('success-message');
                    //         this.reset(); // Reset form
                    //     } else {
                    //         showSwal('error-message', data.message);
                    //     }
                    // })
                    // .catch(error => {
                    //     console.error('Error:', error);
                    //     showSwal('error-message', 'There was an error submitting the form.');
                    // });
                });
            }
        });

    })(jQuery);
} catch (error) {
    console.log("jQuery not found");
}