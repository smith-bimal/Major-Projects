const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

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
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6686549849780a7718259a87" }));

    await Listing.insertMany(initData.data);
    console.log("Sample data initialized");
}

initDB();
