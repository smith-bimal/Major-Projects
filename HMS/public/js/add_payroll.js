const empPayRows = document.querySelectorAll("#add_emp_pay tbody tr");
const empPayForm = document.querySelector("#new_emp_pay");
const empPayTable = document.querySelector(".add-emp-pay-content");

empPayRows.forEach((row) => {
    row.lastElementChild.firstElementChild.addEventListener("click", (e) => {
        e.stopPropagation();
        empPayForm.style.display = "block";
        empPayTable.style.display = "none";

        document.querySelector("#new_pay_emp_id").value = row.children[2].textContent;
        document.querySelector("#new_pay_emp_name").value = row.children[1].textContent;
        document.querySelector("#new_pay_emp_mail").value = row.children[3].textContent;
        document.querySelector("#new_pay_emp_dept").value = row.children[4].textContent;
        document.querySelector("#new_pay_emp_post").value = row.children[5].textContent;
        console.log(row);
    })
});

//close the form when clicked the cancel button on every form
const cancelBtns = document.querySelector("#cancel_btn");

cancelBtns.addEventListener("click", (e) => {
    empPayForm.style.display = "none";
    empPayTable.style.display = "block";
})