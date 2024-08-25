const Listing = require("../models/listing");

module.exports.searchQueryHandler = async (req, res) => {
    try {
        // Fetch all listings from the database
        const listings = await Listing.find({});

        // Get the search query from request parameters
        const searchQuery = req.query.sq;

        // Define a function to filter listings based on search query
        const containsSearchQuery = (listing, searchQuery) => {
            const query = searchQuery.toLowerCase();
            // Use optional chaining (?.) and default to an empty string if properties are undefined
            return (listing.title?.toLowerCase() || '').includes(query) ||
                (listing.location?.toLowerCase() || '').includes(query) ||
                (listing.property_type?.toLowerCase() || '').includes(query) ||
                (listing.country?.toLowerCase() || '').includes(query);
        };

        let filteredListings = listings; // Default to all listings

        if (searchQuery) {
            filteredListings = listings.filter(listing => containsSearchQuery(listing, searchQuery));
        }

        // Render the view with filtered listings or handle case with no results
        if (searchQuery) {
            res.render('pages/search', { properties: filteredListings, searchQuery });
        }

    } catch (error) {
        console.error('Error handling search query:', error);
        res.status(500).send('Internal Server Error');
    }
};
