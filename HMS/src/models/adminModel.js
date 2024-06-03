const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    }
});

const Admin = new mongoose.model("Admin", adminSchema);

module.exports = Admin;