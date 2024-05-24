const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});


document.addEventListener('DOMContentLoaded', function () {
    let urlParams = new URLSearchParams(window.location.search);
    let role = urlParams.get('role');

    if (role === 'doctor') {
        container.classList.remove("right-panel-active");
    } else if (role === 'admin') {
        container.classList.add("right-panel-active");
    }
});