require("dotenv").config({ path: "../.env" });
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_SENDER_EMAIL,
        pass: process.env.NODEMAILER_APP_PASSWORD,
    },
});

const sendMail = async (clientMail, link) => {
    try {
        await transporter.sendMail({
            from: {
                address: process.env.NODEMAILER_SENDER_EMAIL,
                name: "HMS",
            },
            to: clientMail,
            subject: "Reset your password", // Subject line
            html: `<div>
              <p style="margin: 0 0 1.5rem 0; font-weight: 700;">Please click the button the reset the password.</p>
              <a href=${link}><button style="padding: 0.5rem 1rem; font-weight: 600;color:white;background: #2A25D5;border: 1px solid #72f0ca2a;">RESET PASSWORD</button></a>
            </div>`, // html body
        });
        console.log("Mail sent successfully");
    } catch (error) {
        console.log(error);
    }
};

module.exports = { sendMail };
