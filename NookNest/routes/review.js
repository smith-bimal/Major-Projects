const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/review');


// Review Route 
//₋POST Review route₋
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


//₋DELETE Review route₋
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;