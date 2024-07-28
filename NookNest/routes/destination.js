const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const searchController = require('../controllers/destination');

router.get("/all", wrapAsync(searchController.renderAllListings));

router.get("/:id", wrapAsync(searchController.renderCategoryListings));

module.exports = router;