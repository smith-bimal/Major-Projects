const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee_id: {
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
    department: {
        type: String,
    },
    position: {
        type: String,
    },
    salary: {
        type: Number,
    },
    payroll_desc: {
        type: String
    },
    payment_status: {
        type: String,
        default: "Unpaid"
    },
    posted_date: {
        type: Date,
        default: Date.now()
    }
});

const Payroll = new mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;