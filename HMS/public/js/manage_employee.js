// Assuming there is a parent element that contains all the update buttons
const parentElement = document.querySelector("#manage_emp");

parentElement.addEventListener("click", (e) => {
    if (e.target.classList.contains("update-btn")) {
        // Access the row associated with the update button
        const row = e.target.closest("tr");
        console.log(row);

        //show the update form
        document.querySelector("#update_emp_form").style.display = "block";
        document.querySelector(".manage-emp-content").style.display = "none";
    }
});

//close the form when clicked the cancel button on every form
const cancelBtns = document.querySelector("#cancel_btn");

cancelBtns.addEventListener("click", (e) => {
    document.querySelector("#update_emp_form").style.display = "none";
    document.querySelector(".manage-emp-content").style.display = "block";
});