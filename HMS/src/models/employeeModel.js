const mongoose = require("mongoose");

const empSchema = new mongoose.Schema({
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
    contact_number: {
        type: String,
        minLength: 10,
        unique: true
    },
    date_of_birth: {
        type: Date,
    },
    age: {
        type: Number,
        min: 15,
    },
    gender: {
        type: String,
    },
    address: {
        type: String
    },
    pincode: {
        type: String,
    },
    department: {
        type: String,
    },
    position: {
        type: String,
    },
    qualification: {
        type: String,
    },
    experience: {
        type: Number,
    },
    notes: {
        type: String,
    },
    avatar: {
        type: String,
        default: "default.jpg",
    }
});

empSchema.post('save', async function (doc, next) {
    try {
        // Create a new Payroll document with default values
        await Payroll.create({
            employee_id: doc.employee_id,
            full_name: doc.full_name,
            email: doc.email,
            department: doc.department,
            position: doc.position,
        });
        next();
    } catch (error) {
        next(error);
    }
});

const Employee = mongoose.model("Employee", empSchema);

module.exports = Employee;