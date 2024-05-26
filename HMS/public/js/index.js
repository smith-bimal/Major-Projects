const navigations = document.querySelector(".center-nav");
const loginBtn = document.querySelector(".login-sec");
const navMenuBtn = document.querySelector(".fa-bars");

if (window.innerWidth <= 992) {
    let isNavOpen = false;

    navMenuBtn.addEventListener("click", (e) => {
        if (isNavOpen) {
            navigations.classList.add("nav-slide-out");
            loginBtn.classList.add("nav-slide-out");
            navigations.classList.remove("nav-slide-in");
            loginBtn.classList.remove("nav-slide-in");
        } else {
            navigations.classList.add("nav-slide-in");
            loginBtn.classList.add("nav-slide-in");
            navigations.classList.remove("nav-slide-out");
            loginBtn.classList.remove("nav-slide-out");
        }
        isNavOpen = !isNavOpen;
        e.stopPropagation();
    });
}
