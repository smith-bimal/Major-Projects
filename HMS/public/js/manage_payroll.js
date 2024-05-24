// Assuming there is a parent element that contains all the update buttons
const parentElement = document.querySelector("#manage_emp_pay");

parentElement.addEventListener("click", (e) => {
    if (e.target.classList.contains("update-btn")) {
        // Access the row associated with the update button
        const row = e.target.closest("tr");
        console.log(row);
        e.stopPropagation();

        document.querySelector("#manage_pay_emp_id").value = row.children[2].textContent;
        document.querySelector("#manage_pay_emp_name").value = row.children[1].textContent;
        document.querySelector("#manage_pay_emp_mail").value = row.children[3].textContent;

        //show the update form
        document.querySelector("#manage_emp_pay_form").style.display = "block";
        document.querySelector(".manage-emp-pay-content").style.display = "none";
    }
});

//close the form when clicked the cancel button on every form
const cancelBtns = document.querySelector("#cancel_btn");

cancelBtns.addEventListener("click", (e) => {
    document.querySelector("#manage_emp_pay_form").style.display = "none";
    document.querySelector(".manage-emp-pay-content").style.display = "block";
});

