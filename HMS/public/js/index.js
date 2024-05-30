const navigations = document.querySelector(".center-nav");
const loginBtn = document.querySelector(".login-sec");
const navMenuBtn = document.querySelector(".fa-bars");

if (window.innerWidth <= 992) {
    let isNavOpen = true;

    navMenuBtn.addEventListener("click", (e) => {
        if (!isNavOpen) {
            navigations.classList.remove("nav-slide-in");
            loginBtn.classList.remove("log-slide-in");
        } else {
            navigations.classList.add("nav-slide-in");
            loginBtn.classList.add("log-slide-in");
        }
        e.stopPropagation();
        isNavOpen = !isNavOpen;
    });
}
