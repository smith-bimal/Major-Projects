const Admin = require('../src/models/adminModel');
const Doctor = require('../src/models/docModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


module.exports.renderLogin = (req, res) => {
    res.render("login");
}

module.exports.adminLogin = async (req, res) => {
    let admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
        return res.status(404).redirect("err");
    } else {
        bcrypt.compare(req.body.password, admin.password, async (err, result) => {
            if (!result) {
                return res.status(404).redirect("err");
            }

            let token = jwt.sign({ email: admin.email, role: 'admin' }, config.secret_key);
            res.cookie("token", token);
            res.redirect('/admin/dashboard');
        })
    }
};

module.exports.doctorLogin = async (req, res) => {
    let doctor = await Doctor.findOne({ email: req.body.email });
    if (!doctor) {
        return res.status(404).redirect("err");
    }

    bcrypt.compare(req.body.password, doctor.password, async (err, result) => {
        if (!result) {
            return res.status(404).redirect("err");
        }

        let token = jwt.sign({ email: doctor.email, role: 'doctor' }, config.secret_key);
        res.cookie("token", token);
        res.redirect('/doctor/dashboard');
        await Doctor.findOneAndUpdate({ email: req.body.email }, { status: 'Online' });
    })
};