const Listing = require("../models/listing");

module.exports.searchQueryHandler = async (req, res) => {
    const listings = await Listing.find({});

    // Search query handling
    const searchQuery = req.query.sq;

    // Define a function to filter listings based on search query
    const containsSearchQuery = (listing, searchQuery) => {
        const query = searchQuery.toLowerCase();
        return listing.title.toLowerCase().includes(query) ||
            listing.location.toLowerCase().includes(query) ||
            listing.property_type.toLowerCase().includes(query) ||
            listing.country.toLowerCase().includes(query);
    };

    let filteredListings = listings; // Default to all listings

    if (searchQuery) {
        filteredListings = listings.filter(listing => containsSearchQuery(listing, searchQuery));
    }

    // Render the appropriate view based on whether there's a search query
    if (searchQuery) {
        res.render('listings/search', { properties: filteredListings, searchQuery });
    }
}