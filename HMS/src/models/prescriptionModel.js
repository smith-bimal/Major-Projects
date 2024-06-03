const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
    },
    age: {
        type: Number,
    },
    address: {
        type: String,
    },
    type: {
        type: String,
    },
    ailment: {
        type: String,
    },
    notes: {
        type: String,
    }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

module.exports = Prescription;