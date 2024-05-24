const viewDocRows = document.querySelectorAll("#view_doc tbody tr");
const viewDocProfile = document.querySelector(".doc-profile");

let overlay = document.createElement("div");
overlay.className = "overlay";

viewDocRows.forEach((row) => {
    row.lastElementChild.firstElementChild.addEventListener("click", (e) => {
        e.stopPropagation();
        viewDocProfile.style.display = "flex";
        document.querySelector(".main").appendChild(overlay);

        document.querySelector("#doc_profile_name").innerText = row.children[1].textContent;
        document.querySelector("#doc_profile_id").innerText = row.children[2].textContent;
        document.querySelector("#doc_profile_email").innerText = row.children[3].textContent;
        document.querySelector("#doc_profile_specialty").innerText = row.children[4].textContent;
        document.querySelector("#doc_profile_status").innerText = row.children[5].textContent;

        if (document.querySelector("#doc_profile_status").innerText == "Online") {
            document.querySelector("#doc_profile_status").style.backgroundColor = "#1FBFC3";
        } else {
            document.querySelector("#doc_profile_status").style.backgroundColor = "#FE686B";
        }
        console.log(row);
    })
});

//close the form when clicked the close button on every form
const closeBtns = document.querySelector(".doc-profile-clost-btn i");

closeBtns.addEventListener("click", (e) => {
    viewDocProfile.style.display = "none";
    overlay.remove();
})