const mongoose = require("mongoose");

const labSchema = new mongoose.Schema({
    patient_id: {
        type: String,
    },
    name: {
        type: String,
    },
    ailment: {
        type: String,
    },
    type: {
        type: String,
    },
    lab_tests: {
        type: String,
    },
    lab_results: {
        type: String,
    },
    result_date: {
        type: Date,
        default: Date.now(),
    },
    heart_rate: {
        type: Number,
    },
    blood_pressure: {
        type: String
    },
    temperature: {
        type: Number,
    },
    resp_rate: {
        type: Number,
    },
    oxygen_sat: {
        type: Number,
    }
});

const LabReport = mongoose.model("LabReport", labSchema);

module.exports = LabReport;
