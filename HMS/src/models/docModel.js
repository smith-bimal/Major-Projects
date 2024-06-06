const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    doc_id: {
        type: String,
        unique: true
    },
    full_name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    contact_number: {
        type: String,
        unique: true
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    specialty: {
        type: String,
    },
    experience: {
        type: Number,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        default: "Offline",
    },
    qualification: {
        type: String,
    },
    notes: {
        type: String,
    },
    bio: {
        type: String,
        default: "No Bio"
    },
    avatar: {
        type: String,
        default: "default.png"
    }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
