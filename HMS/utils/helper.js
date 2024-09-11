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


//Sending reset password mail function
function sendResetPasswordMail(email, link) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'info@hmsexample.com',
            pass: 'yourpassword'
        }
    });

    let mailOptions = {
        from: 'info@hmsexample.com',
        to: email,
        subject: 'Reset your HMS login password!!!',
        text: `Click the below mentioned link to reset your HMS login password \n ${link}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { fetchAdminDetails, fetchDoctorDetails, sendResetPasswordMail };