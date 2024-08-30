//offerings icons as per the availability
const offerings = document.querySelectorAll(".offerings-container div table tr td");
const allAmenities = document.querySelectorAll("#amenities_container div label");
const offeringsPopup = document.querySelectorAll(".amenities-popup tr td");

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

offerings.forEach(offer => {
    replaceOfferingIcons(offer);
})

offeringsPopup.forEach(offer => {
    replaceOfferingIcons(offer);
})

allAmenities.forEach(offering => {
    replaceOfferingIcons(offering);
})

function replaceOfferingIcons(offering) {
    switch (offering.innerText) {
        case "Kitchen facilities":
            offering.innerHTML = `<i class="fa-solid fa-kitchen-set me-3"></i></td><td>Kitchen facilities`;
            break;
        case "Living room":
            offering.innerHTML = `<i class="fa-solid fa-couch me-3"></i></td><td>Living room`;
            break;
        case "Fridge":
            offering.innerHTML = `<i class="fa-solid fa-toilet-portable me-3"></i></td><td>Fridge`;
            break;
        case "Balcony or patio":
            offering.innerHTML = `<i class="fa-solid fa-xmarks-lines me-3"></i></td><td>Balcony or patio`;
            break;
        case "Heating":
            offering.innerHTML = `<i class="fa-solid fa-hot-tub-person me-3"></i></td><td>Heating`;
            break;
        case "Air conditioning":
            offering.innerHTML = `<i class="fa-solid fa-wind me-3"></i></td><td>Air conditioning`;
            break;
        case "High-speed internet":
            offering.innerHTML = `<i class="fa-solid fa-wifi me-3"></i></td><td>High-speed internet`;
            break;
        case "Cable TV":
            offering.innerHTML = `<i class="fa-solid fa-tv me-3"></i></td><td>Cable TV`;
            break;
        case "Washer and dryer":
            offering.innerHTML = `<i class="fa-solid fa-soap me-3"></i></td><td>Washer and dryer`;
            break;
        case "Closet space":
            offering.innerHTML = `<i class="fa-solid fa-shirt me-3"></i></td><td>Closet space`;
            break;
        case "Parking availability":
            offering.innerHTML = `<i class="fa-solid fa-car-rear me-3"></i></td><td>Parking availability`;
            break;
        case "Elevator access":
            offering.innerHTML = `<i class="fa-solid fa-elevator me-3"></i></td><td>Elevator access`;
            break;
        case "Security system":
            offering.innerHTML = `<i class="fa-solid fa-key me-3"></i></td><td>Security system`;
            break;
        case "Pet-friendly":
            offering.innerHTML = `<i class="fa-solid fa-paw me-3"></i></td><td>Pet-friendly`;
            break;
        case "Garden view":
            offering.innerHTML = `<i class="fa-solid fa-tree me-3"></i></td><td>Garden view`;
            break;
        case "Lake view":
            offering.innerHTML = `<i class="fa-solid fa-water me-3"></i></td><td>Lake view`;
            break;
        case "Dining table":
            offering.innerHTML = `<i class="fa-solid fa-chair me-3"></i></td><td>Dining table`;
            break;
        case "Mountain view":
            offering.innerHTML = `<i class="fa-solid fa-mountain me-3"></i></td><td>Mountain view`;
            break;
        case "Ocean view":
            offering.innerHTML = `<i class="fa-solid fa-water me-3"></i></td><td>Ocean view`;
            break;
        case "Proximity to public transportation":
            offering.innerHTML = `<i class="fa-solid fa-truck-plane me-3"></i></td><td>Proximity to public transportation`;
            break;
        case "Gym or fitness center":
            offering.innerHTML = `<i class="fa-solid fa-dumbbell me-3"></i></td><td>Gym or fitness center`;
            break;
        case "Swimming pool":
            offering.innerHTML = `<i class="fa-solid fa-person-swimming me-3"></i></td><td>Swimming pool`;
            break;
        case "Nearby shopping and dining options":
            offering.innerHTML = `<i class="fa-solid fa-basket-shopping me-3"></i></td><td>Nearby shopping and dining options`;
            break;
        case "Quiet neighborhood":
            offering.innerHTML = `<i class="fa-regular fa-bell-slash me-3"></i></td><td>Quiet neighborhood`;
            break;
        case "Smoke-free environment":
            offering.innerHTML = `<i class="fa-solid fa-ban-smoking me-3"></i></td><td>Smoke-free environment`;
            break;
        case "Recycling facilities":
            offering.innerHTML = `<i class="fa-solid fa-recycle me-3"></i></td><td>Recycling facilities`;
            break;
        case "Maintenance services":
            offering.innerHTML = `<i class="fa-solid fa-screwdriver-wrench me-3"></i></td><td>Maintenance services`;
            break;
        case "24-hour emergency contact":
            offering.innerHTML = `<i class="fa-solid fa-truck-medical me-3"></i></tr><td>24-hour emergency contact`;
            break;
    };
}


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


// show all amenities button functionality

const amenitiesShowBtn = document.querySelector(".show-amenities-btn");
const amenitiesCloseBtn = document.querySelector(".close-btn.amenities-close-btn");
if (amenitiesShowBtn && amenitiesCloseBtn) {
    amenitiesShowBtn.addEventListener("click", () => {
        showAmenitiesContainer();
    });

    amenitiesCloseBtn.addEventListener("click", () => {
        closeAmenitiesContainer();
    });
}


function showAmenitiesContainer() {
    document.querySelector(".amenities-container").style.display = "flex";
    document.querySelector(".amenities-popup").style.display = "block";
}
function closeAmenitiesContainer() {
    document.querySelector(".amenities-container").style.display = "none";
    document.querySelector(".amenities-popup").style.display = "none";
}


// amenities section for the new page

let amenityCheckBtn = document.getElementById("has_amenity");

if (amenityCheckBtn) {
    amenityCheckBtn.addEventListener("click", () => {
        if (amenityCheckBtn.checked) {
            document.getElementById("amenities_container").style.display = "block";
            document.getElementById("amenity_check_label").innerText = "Select the appropriate amenities";
        } else {
            document.getElementById("amenities_container").style.display = "none";
            document.getElementById("amenity_check_label").innerText = "Check if the location provides amenities";
        }
    })
}