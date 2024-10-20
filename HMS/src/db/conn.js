const mongoose = require('mongoose');

mongoose.connect(process.env.ATLASDB_URL, {
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Couldn't connect to database");
});