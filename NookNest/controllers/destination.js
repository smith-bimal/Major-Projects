const Listing = require("../models/listing");

module.exports.renderAllListings = async (req, res) => {
    const properties = await Listing.find({}).populate("reviews");
    const allProperties = true;
    res.render('pages/destination', { properties, allProperties });
}

module.exports.renderCategoryListings = async (req, res) => {
    const properties = await Listing.find({ property_type: req.params.id }).populate("reviews");
    const allProperties = false;
    res.render('pages/destination', { properties, allProperties });
}