const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/hms_database", {
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Couldn't connect to database");
});