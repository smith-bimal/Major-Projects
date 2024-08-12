const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");
const initData = require("./listing_data");
const { reviews } = require("./review_data");
const { users } = require("./user_data");

const MONGO_URL = "mongodb://127.0.0.1:27017/nookNest";

main().then(() => {
    console.log("Connected to the database");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "66a91e29265965f6fe895151" }));

    await Listing.insertMany(initData.data);
    console.log("Sample listing data initialized");

    await Review.deleteMany({});
    await Review.insertMany(reviews);
    console.log("Sample User data initialized");


    await User.deleteMany({});
    await User.insertMany(users);
    console.log("Sample review data initialized");
}

initDB();
