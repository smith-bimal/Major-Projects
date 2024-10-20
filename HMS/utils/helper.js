const Admin = require("../src/models/adminModel");
const Doctor = require("../src/models/docModel");

const nodemailer = require('nodemailer');

//Function to fetch logged in doctor information
async function fetchAdminDetails(userEmail) {
    let admin = await Admin.findOne({ email: userEmail });
    if (!admin) {
        admin = await Doctor.findOne({ email: userEmail });
    }
    return admin;
};

//Function to fetch logged in doctor information
async function fetchDoctorDetails(userEmail) {
    const doctor = await Doctor.findOne({ email: userEmail });
    return doctor;
};

module.exports = { fetchAdminDetails, fetchDoctorDetails };