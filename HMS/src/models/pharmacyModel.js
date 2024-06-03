const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    category: {
        type: String,
    },
    vendor: {
        type: String,
    },
    barcode_number: {
        type: String,
        unique: true
    },
    description: {
        type: String,
    }
});

const Pharmacy = new mongoose.model("Pharmacy", pharmacySchema);

module.exports = Pharmacy;