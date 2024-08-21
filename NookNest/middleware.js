const Listing = require("./models/listing");
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require("./schema");
const Review = require("./models/review");


// Checks if the user is logged in or not 
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to access this page!');
        return res.redirect('/listings');
    }
    next();
};

// Saves the previous URL before asking for login  
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// Check if the requested post edit or delete belongs to the owner 
module.exports.isOwner = async (req, res, next) => {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to access this page.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Check if the review belongs to the owner before deleteing 
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Validate listing middleware function using JOI library 
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        console.log(error);
        let errMsg = error.details[0].message;
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// Validate review middleware function using JOI library 
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details[0].message;
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}
