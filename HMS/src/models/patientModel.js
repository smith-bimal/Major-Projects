const mongoose = require("mongoose");
const LabReport = require("./labModel"); // Import the LabReport model

const patientSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    dob: {
        type: Date,
    },
    age: {
        type: Number,
        min: 15,
    },
    gender: {
        type: String,
    },
    contact: {
        type: String,
        minLength: 10,
    },
    emergency_contact: {
        type: String,
        minLength: 10,
    },
    address: {
        type: String
    },
    marital_status: {
        type: String,
    },
    ailment: {
        type: String,
    },
    type: {
        type: String,
    },
    doc_assign: {
        type: String,
    },
    treat_status: {
        type: String,
        default: "Ongoing",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    is_discharged: {
        type: Boolean,
        default: 0,
    }
});

// Add the post save hook
patientSchema.post('save', async function (doc, next) {
    try {
        // Create a new LabReport document with default values
        await LabReport.create({
            patient_id: doc.patient_id,
            name: doc.name,
            ailment: doc.ailment,
            type: doc.type,
        });
        next();
    } catch (error) {
        next(error);
    }
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
