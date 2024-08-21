const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require('../controllers/listing');

const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

// Index Route 
router.route('/').get(wrapAsync(listingController.index))
    // Create Route 
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// New Route 
router.get('/new', isLoggedIn, listingController.renderNewForm);

// Show Route 
router.route('/:id').get(wrapAsync(listingController.renderListingView))
    // Update Route 
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), wrapAsync(listingController.updateListing))
    // Delete Route 
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


// Edit Route 
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;