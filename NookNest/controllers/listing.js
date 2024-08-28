const moment = require("moment");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const checkAge = require("../utils/moment");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    // Fetch all listings
    const listings = await Listing.find({});
    const villas = await Listing.find({ property_type: 'Villa' }).populate("reviews");
    const apartments = await Listing.find({ property_type: 'Apartment' });
    const resorts = await Listing.find({ property_type: 'Resort' });
    const cottages = await Listing.find({ property_type: 'Cottage' });
    const popularListings = await Listing.find({ reviews: { $ne: [] } }).populate("reviews");
    const placesWithReview = popularListings.sort((a, b) => b.reviews.length - a.reviews.length);//sorting all the listings with descending number of reviews

    res.render('pages/index', { listings, villas, apartments, resorts, cottages, placesWithReview });
};

module.exports.renderNewForm = (req, res) => {
    res.render("pages/new");
}

module.exports.renderListingView = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash('error', 'Listing requested for does not exist!');
        res.redirect(`/listings`);
    }
    res.render('pages/show', { listing, checkAge });
}

module.exports.createListing = async (req, res, next) => {

    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location + ", " + req.body.listing.country,
        limit: 1
    }).send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: req.file.path, filename: req.file.filename };

    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash('success', 'New Listing created successfully!');
    res.redirect(`/listings`);
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing requested for does not exist!');
        res.redirect(`/listings`);
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200,r_16:16:16:16/f_auto");

    res.render("pages/edit", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location + " " + req.body.listing.country,
        limit: 1
    }).send();

    const id = req.params.id;

    await Listing.findByIdAndUpdate(id, { geometry: response.body.features[0].geometry });
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        updatedListing.image = { url: req.file.path, filename: req.file.filename };
        await updatedListing.save();
    }

    req.flash('success', 'Details updated successfully!');
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    const id = req.params.id;
    await Listing.findByIdAndDelete(id);

    req.flash('success', 'Listing deleted successfully!');
    res.redirect("/listings");
}
