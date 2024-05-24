const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/hms_Database", {
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Couldn't connect to database");
});