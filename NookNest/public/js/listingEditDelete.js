const allMenuBtns = document.querySelectorAll('.menu-btn');
let openMenu = null; // This will keep track of the currently open menu

// Function to open a menu
function openMenuHandler(btn) {
    // Close any currently open menu
    if (openMenu && openMenu !== btn.nextElementSibling) {
        openMenu.style.display = 'none';
    }

    // Open the clicked menu
    const menu = btn.nextElementSibling;
    menu.style.display = 'block';
    openMenu = menu; // Update the open menu reference
}

// Function to close the menu
function closeMenu() {
    if (openMenu) {
        openMenu.style.display = 'none';
        openMenu = null; // Reset the open menu reference
    }
}

// Add event listeners to menu buttons
allMenuBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        // Prevent the click event from propagating to the document
        event.stopPropagation();
        
        // Open the menu
        openMenuHandler(btn);
    });
});

// Add a click listener to the document
document.addEventListener('click', closeMenu);
