const mongoose = require("mongoose");

const dischargeSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    contact: {
        type: String,
        minLength: 10,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
    },
    emergency_contact: {
        type: String,
        minLength: 10,
    },
    address: {
        type: String,
    },
    created_at: {
        type: Date,
    },
    reason: {
        type: String,
    },
    discharge_time: {
        type: Date,
    },
    primary_diag: {
        type: String,
    },
    secondary_diag: {
        type: String,
    },
    treat_summary: {
        type: String,
    },
    procedures: {
        type: String,
    },
    medications: {
        type: String,
    }
});

const Discharge = mongoose.model("Discharge", dischargeSchema);

module.exports = Discharge;
