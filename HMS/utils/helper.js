const Admin = require("../src/models/adminModel");
const Doctor = require("../src/models/docModel");

//Function to fetch logged in doctor information
async function fetchAdminDetails(adminEmail) {
    const admin = await Admin.findOne({ email: adminEmail });
    return admin;
};

//Function to fetch logged in doctor information
async function fetchDoctorDetails(userEmail) {
    const doctor = await Doctor.findOne({ email: userEmail });
    return doctor;
};

module.exports = { fetchAdminDetails, fetchDoctorDetails };