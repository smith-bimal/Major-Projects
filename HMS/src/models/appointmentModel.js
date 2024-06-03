const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    contact: {
        type: String,
        unique: true
    },
    dob: {
        type: Date,
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    pincode: {
        type: String,
    },
    app_doc: {
        type: String
    },
    app_date: {
        type: Date,
    },
    reason: {
        type: String,
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        default: "Pending"
    }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;