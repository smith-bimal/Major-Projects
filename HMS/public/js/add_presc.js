const prescAddRows = document.querySelectorAll("#add_presc tbody tr");
const prescForm = document.querySelector("#new_patient_presc");
const prescTable = document.querySelector("#add_presc_table");

prescAddRows.forEach((row) => {
    row.lastElementChild.firstElementChild.addEventListener("click", (e) => {
        e.stopPropagation();
        prescForm.style.display = "block";
        prescTable.style.display = "none";

        document.querySelector("#patient_presc_name").value = row.children[1].textContent;
        document.querySelector("#patient_presc_id").value = row.children[2].textContent;
        document.querySelector("#patient_presc_address").value = row.children[3].textContent;
        document.querySelector("#patient_presc_age").value = row.children[4].textContent;
        document.querySelector("#patient_presc_type").value = row.children[5].textContent;
        console.log(row.children[1].textContent);
    })
});

//close the form when clicked the cancel button on every form
const cancelBtns = document.querySelector("#cancel_btn");

cancelBtns.addEventListener("click", (e) => {
    prescForm.style.display = "none";
    prescTable.style.display = "block";
})