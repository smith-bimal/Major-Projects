const distance = require('geo-dist-calc');
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const { getCurrentLocation } = require('../geoLocation');

module.exports.index = async (req, res) => {
    const sourcePoints = await getCurrentLocation();
    const listings = await Listing.find().populate({
        path: "reviews",
    });

    let coordinatesArr = [];

    listings.forEach(listing => {
        let listingCoordinates = {};
        listingCoordinates.id = listing.id;
        listingCoordinates.latitude = listing.geometry.coordinates[1];
        listingCoordinates.longitude = listing.geometry.coordinates[0];

        let destinationPoints = { latitude: listing.geometry.coordinates[1], longitude: listing.geometry.coordinates[0] };

        let ResultantDistance = distance.discal(sourcePoints, destinationPoints);
        listingCoordinates.distance = ResultantDistance;

        coordinatesArr.push(listingCoordinates);
    })
    res.render('listings/index', { listings, coordinatesArr });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
}

module.exports.renderListingView = async (req, res) => {

    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash('error', 'Listing requested for does not exist!');
        res.redirect(`/listings`);
    }
    res.render('listings/show', { listing });
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
    console.log(newListing);
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

    res.render("listings/edit", { listing, originalImageUrl });
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