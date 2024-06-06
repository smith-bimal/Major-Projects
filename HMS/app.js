const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const fs = require("fs");
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const config = require('./config/config');


//Image uploading configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
}).single("avatar");



//database files acquiring
require("./src/db/conn");
const Admin = require("./src/models/adminModel");
const Appointment = require("./src/models/appointmentModel");
const Pharmacy = require("./src/models/pharmacyModel");
const Prescription = require("./src/models/prescriptionModel");
const Patient = require("./src/models/patientModel");
const Doctor = require("./src/models/docModel");
const Employee = require("./src/models/employeeModel");
const LabReport = require("./src/models/labModel");
const Discharge = require("./src/models/dischargeModel");
const Payroll = require("./src/models/payrollModel");


// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates/views"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Configure express-session middleware
app.use(session({
    secret: config.secret_key, // Use the secret key from your config
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to log all requests
app.use((req, res, next) => {
    const logDetails = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}\n`;
    fs.appendFile(path.join(__dirname, 'log.txt'), logDetails, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
    next();
});

//Middleware to set user type based on URL path
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        req.session.userType = 'admin';
    } else if (req.path.startsWith('/doctor')) {
        req.session.userType = 'doctor';
    }
    next();
});


app.get("/", (req, res) => {
    res.render("index");
});

app.route("/login").get((req, res) => {
    res.render("login");
});

//login routes-------------------------------------------------
app.post("/login/admin", async (req, res) => {
    let admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
        return res.status(404).send("Wrong Credentials.");
    } else {
        if (req.body.password != admin.password) {
            req.session.message = {
                message: "Wrong Credentials."
            }
            return res.status(404).send("Wrong Credentials.");
        } else {
            let token = jwt.sign({ email: admin.email, role: 'admin' }, config.secret_key);
            res.cookie("token", token);
            res.redirect('/admin/dashboard');
        }
    }
});

app.post("/login/doctor", async (req, res) => {
    let doctor = await Doctor.findOne({ email: req.body.email });
    if (!doctor) {
        return res.status(404).send("Wrong Credentials.");
    }

    bcrypt.compare(req.body.password, doctor.password, async (err, result) => {
        if (!result) {
            return res.status(404).send("Wrong Credentials.");
        }

        let token = jwt.sign({ email: doctor.email, role: 'doctor' }, config.secret_key);
        res.cookie("token", token);
        res.redirect('/doctor/dashboard');
        await Doctor.findOneAndUpdate({ email: req.body.email }, { status: 'Online' });
    })
});

// admin section start-----------------------------------------
app.route("/admin/dashboard")
    .get(isAdminOrDoctor, async (req, res) => {
        const userType = req.session.userType;
        const appointments = await Appointment.find({});
        const pharmacies = await Pharmacy.find({});
        const patients = await Patient.find({});
        const ongoingPatients = await Patient.find({ treat_status: "Ongoing" });
        const employees = await Employee.find({});
        const doctors = await Doctor.find({});
        const activeDoctors = await Doctor.find({ status: "Online" });
        const admin = await fetchAdminDetails(req.user.email);
        res.render("admin", { admin, employees, patients, ongoingPatients, appointments, doctors, activeDoctors, pharmacies, userType });
    });

app.route("/admin/appointment/create").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("create_app", { admin, doctors, userType });
}).post(isAdminOrDoctor, async (req, res) => {
    const newAppoint = new Appointment(req.body);

    try {
        await newAppoint.save();
        res.status(201).redirect('/admin/appointment/manage');
    } catch (error) {
        res.status(400).redirect('/admin/appointment/create');
    }
});

app.get("/admin/appointment/manage", isAdminOrDoctor, async (req, res) => {
    const appointments = await Appointment.find({});
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_app", { admin, appointments, userType });
});

app.route("/admin/appointment/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let doctors = await Doctor.find({});
    let app = await Appointment.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("update_app", { admin, app, doctors, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                contact: req.body.contact,
                dob: req.body.dob,
                age: req.body.age,
                gender: req.body.gender,
                address: req.body.address,
                pincode: req.body.pincode,
                app_doc: req.body.app_doc,
                app_date: req.body.app_date,
                reason: req.body.reason,
                notes: req.body.notes,
                status: req.body.app_sts,
            },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) {
            return res.status(404).send('Appointment not found');
        }

        res.redirect("/admin/appointment/manage");
    } catch (error) {
        res.status(500).redirect("/admin/appointment/manage");
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).send('Appointment not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.route("/admin/pharmacy/add").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_pharma", { admin, userType });
}).post(isAdminOrDoctor, async (req, res) => {
    const newPharmacy = new Pharmacy(req.body);
    try {
        await newPharmacy.save();
        res.status(201).redirect('/admin/pharmacy/manage');
    } catch (error) {
        res.status(400).redirect('/admin/pharmacy/add');
    }
});

app.get("/admin/pharmacy/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const pharmacies = await Pharmacy.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_pharma", { admin, pharmacies, userType });
});

app.route("/admin/pharmacy/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let pharma = await Pharmacy.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("update_pharma", { admin, pharma, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                quantity: req.body.quant,
                category: req.body.categ,
                vendor: req.body.vendor,
                barcode_number: req.body.bc,
                description: req.body.description
            },
            { new: true, runValidators: true }
        );

        if (!updatedPharmacy) {
            return res.status(404).send('Pharmacy not found');
        }

        res.redirect("/admin/pharmacy/manage");
    } catch (error) {
        res.status(500).redirect("/admin/pharmacy/manage");
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedPharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        if (!deletedPharmacy) {
            return res.status(404).send('Pharmacy not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/admin/prescription/add", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const prescriptions = await Prescription.find({});

    // Create a set of patient IDs who already have prescriptions
    const patientsWithPrescriptions = new Set(prescriptions.map(presc => presc.patient_id));

    // Filter out patients who do not have prescriptions
    const patientsWithoutPrescriptions = patients.filter(patient => !patientsWithPrescriptions.has(patient.patient_id));

    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_presc", { patients: patientsWithoutPrescriptions, admin, userType });
});

app.route("/admin/prescription/add/:id")
    .get(isAdminOrDoctor, async (req, res) => {
        const userType = req.session.userType;
        const patient = await Patient.findOne({ patient_id: req.params.id });
        const admin = await fetchAdminDetails(req.user.email);
        res.render("add_new_presc", { admin, patient, userType });
    })
    .post(isAdminOrDoctor, async (req, res) => {
        const newPrescription = new Prescription(req.body);
        try {
            await newPrescription.save();
            res.status(201).redirect("/admin/prescription/q");
        } catch (error) {
            res.status(400).redirect("/admin/prescription/add");
        }
    });


app.get("/admin/prescription/q", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const prescriptions = await Prescription.find({});
    const patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("view_presc", { admin, patients, prescriptions, userType });
});

app.get("/admin/prescription/q/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let presc = await Prescription.findOne({ patient_id: req.params.id });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("prescription", { admin, patient, presc, userType });
});

app.get("/admin/prescription/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let prescriptions = await Prescription.find({});
    let patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_presc", { admin, patients, prescriptions, userType });
});

app.route("/admin/prescription/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    let presc = await Prescription.findById(req.params.id);
    res.render("update_presc", { admin, presc, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedPrescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                age: req.body.age,
                address: req.body.address,
                type: req.body.type,
                ailment: req.body.ailment,
                notes: req.body.notes
            },
            { new: true, runValidators: true }
        );

        if (!updatedPrescription) {
            return res.status(404).send('prescription not found');
        }

        res.redirect("/admin/prescription/q");
    } catch (error) {
        res.status(500).send('Error updating prescription');
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!deletedPrescription) {
            return res.status(404).send('Prescription not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/admin/lab/tests", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({ treat_status: "Ongoing" });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("patient_lab_test", { admin, patients, userType });
})

app.route("/admin/lab/tests/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_lab_test", { admin, patient, lab, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedVitals = await LabReport.findOneAndUpdate(
            { patient_id: req.params.id },
            {
                name: req.body.name,
                ailment: req.body.ailment,
                patient_id: req.body.id,
                lab_tests: req.body.tests,
            },
            { new: true, runValidators: true }
        );

        if (!updatedVitals) {
            return res.status(404).send('Vitals data not found');
        }

        res.redirect("/admin/lab/tests");
    } catch (error) {
        res.status(500).send('Error updating Vitals data');
    }
});

app.get("/admin/lab/results", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const admin = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { admin, patients, labs, userType });
})

app.route("/admin/lab/results/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_lab_result", { admin, lab, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedLabResult = await LabReport.findByIdAndUpdate(
            req.params.id,
            {
                result_date: req.body.result_date,
                lab_results: req.body.results
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabResult) {
            return res.status(404).send('Lab Results not found');
        }

        res.redirect("/admin/lab/results");
    } catch (error) {
        res.status(500).send('Error updating Lab Results');
    }
});

app.get("/admin/patient/vitals", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const admin = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_vitals", { admin, patients, labs, userType });
});

app.route("/admin/patient/vitals/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_patient_vitals", { admin, lab, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedLabTest = await LabReport.findByIdAndUpdate(
            req.params.id,
            {
                heart_rate: req.body.hr,
                blood_pressure: req.body.bp,
                temperature: req.body.temp,
                resp_rate: req.body.resp,
                oxygen_sat: req.body.spo2
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabTest) {
            return res.status(404).send('Lab tests not found');
        }

        res.redirect("/admin/patient/vitals");
    } catch (error) {
        res.status(500).send('Error updating Lab Tests');
    }
});

app.get("/admin/lab/reports", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const admin = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { admin, patients, labs, userType });
});

app.get("/admin/lab/reports/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("view_lab_report", { admin, lab, patient, userType });
});

app.route("/admin/doctor/add").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_doctor", { admin, userType });
}).post(isAdminOrDoctor, upload, async (req, res) => {
    const { full_name, email, contact_number, dob, gender, address, pincode, doc_id, specialty, qualification, experience, username, password, notes, avatar } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).send("error generating salt");

        bcrypt.hash(password, salt, async (err, hash) => {
            const newDoctor = new Doctor({
                full_name,
                email,
                contact_number,
                dob,
                gender,
                address,
                pincode,
                doc_id,
                specialty,
                qualification,
                experience,
                username,
                password: hash,
                notes,
                avatar: req.file.filename
            });

            try {
                await newDoctor.save();
                res.status(201).redirect("/admin/doctor/q")
            } catch (error) {
                res.status(400).redirect("/admin/doctor/add");
            }
        })
    })
});

app.route("/admin/doctor/q").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("view_doctor", { admin, doctors, userType });
});

app.get("/admin/doctor/q/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let doctor = await Doctor.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("doctor_profile", { admin, doctor, userType });
});

app.get("/admin/doctor/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_doctor", { admin, doctors, userType });
});

app.route("/admin/doctor/manage/:id")
    .get(isAdminOrDoctor, async (req, res) => {
        try {
            const userType = req.session.userType;
            const doctor = await Doctor.findById(req.params.id);
            const admin = await fetchAdminDetails(req.user.email);

            if (!doctor) {
                return res.status(404).send('Doctor not found');
            }

            res.render("update_doctor", { admin, doctor, userType });
        } catch (error) {
            console.error("Error fetching doctor details:", error);
            res.status(500).send('Internal Server Error');
        }
    })
    .patch(isAdminOrDoctor, upload, async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Check if a file is uploaded
            let avatar = req.body.avatar;
            if (req.file) {
                avatar = req.file.filename;
            }

            let updateData = {};

            if (req.body.password == "" || !req.body.password) {
                updateData = {
                    full_name: req.body.name,
                    email: req.body.email,
                    contact_number: req.body.contact,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    address: req.body.address,
                    pincode: req.body.pincode,
                    doc_id: req.body.id,
                    specialty: req.body.spec,
                    qualification: req.body.qual,
                    experience: req.body.exp,
                    username: req.body.username,
                    notes: req.body.note,
                    avatar: avatar,
                }
            } else if (avatar == "" || !avatar || !req.file) {
                updateData = {
                    full_name: req.body.name,
                    email: req.body.email,
                    contact_number: req.body.contact,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    address: req.body.address,
                    pincode: req.body.pincode,
                    doc_id: req.body.id,
                    specialty: req.body.spec,
                    qualification: req.body.qual,
                    experience: req.body.exp,
                    username: req.body.username,
                    password: hashedPassword,
                    notes: req.body.note,
                }
            } else {
                updateData = {
                    full_name: req.body.name,
                    email: req.body.email,
                    contact_number: req.body.contact,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    address: req.body.address,
                    pincode: req.body.pincode,
                    doc_id: req.body.id,
                    specialty: req.body.spec,
                    qualification: req.body.qual,
                    experience: req.body.exp,
                    username: req.body.username,
                    password: hashedPassword,
                    notes: req.body.note,
                    avatar: avatar,
                }
            }

            const updatedDoctor = await Doctor.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedDoctor) {
                return res.status(404).send('Doctor not found');
            }

            res.redirect("/admin/doctor/manage");
        } catch (error) {
            console.error("Error updating doctor:", error);
            res.status(500).send('Internal Server Error');
        }
    }).delete(isAdminOrDoctor, async (req, res) => {
        try {
            const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
            if (!deletedDoctor) {
                return res.status(404).send('Doctor not found');
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

app.route("/admin/patient/register").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("register_patient", { admin, userType });
}).post(isAdminOrDoctor, async (req, res) => {
    const newPatient = new Patient(req.body);
    try {
        await newPatient.save();
        res.status(201).redirect("/admin/patient/q")
    } catch (error) {
        res.status(400).redirect("/admin/patient/q");
    }
});

app.get("/admin/patient/q", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("view_patient", { admin, patients, userType });
});

app.get("/admin/patient/q/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("patient_profile", { admin, patient, lab, userType });
});

app.get("/admin/patient/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_patient", { admin, patients, userType });
});

app.route("/admin/patient/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findById(req.params.id);
    const doctors = await Doctor.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("update_patient", { admin, patient, doctors, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                patient_id: req.body.id,
                email: req.body.email,
                dob: req.body.dob,
                age: req.body.age,
                gender: req.body.gender,
                contact: req.body.contact,
                emergency_contact: req.body.em_contact,
                address: req.body.address,
                marital_status: req.body.marital_sts,
                ailment: req.body.ailment,
                type: req.body.type,
                treat_status: req.body.status,
                doc_assign: req.body.assign_doc
            },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).send('Patient details not found');
        }

        res.redirect("/admin/patient/manage");
    } catch (error) {
        res.status(500).send('Error updating Patient details');
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        await LabReport.findOneAndDelete({ patient_id: deletedPatient.patient_id });

        if (!deletedPatient) {
            return res.status(404).send('Patient not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/admin/patient/discharge", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("discharge_patient", { admin, patients, userType });
});

app.route("/admin/patient/discharge/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("discharge_form", { admin, patient, userType });
}).post(isAdminOrDoctor, async (req, res) => {
    const newDischarge = new Discharge(req.body);
    try {
        await newDischarge.save();
        await Patient.findOneAndUpdate(
            { patient_id: req.params.id },
            {
                treat_status: "Completed",
                is_discharged: 1,
            },
            { new: true, runValidators: true }
        );

        res.status(201).redirect("/admin/patient/discharge");
    } catch (error) {
        res.status(400).redirect("/admin/patient/discharge");
    }
});

app.route("/admin/employee/add").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_employee", { admin, userType });
}).post(isAdminOrDoctor, upload, async (req, res) => {
    const newEmployee = new Employee({ ...req.body, avatar: req.file.filename });
    try {
        await newEmployee.save();
        res.status(201).redirect("/admin/employee/q")
    } catch (error) {
        res.status(400).redirect("/admin/employee/q");
    }
});

app.get("/admin/employee/q", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("view_employee", { admin, employees, userType });
});

app.get("/admin/employee/q/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    const employee = await Employee.findById(req.params.id);
    res.render("employee_profile", { admin, employee, userType });
});

app.get("/admin/employee/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_employee", { admin, employees, userType });
});

app.route("/admin/employee/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const employee = await Employee.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("update_employee", { admin, employee, userType });
}).patch(isAdminOrDoctor, upload, async (req, res) => {
    let updateData = {};

    if (!req.file) {
        updateData = {
            full_name: req.body.name,
            email: req.body.email,
            contact_number: req.body.contact,
            date_of_birth: req.body.dob,
            gender: req.body.gender,
            age: req.body.age,
            address: req.body.address,
            pincode: req.body.pincode,
            employee_id: req.body.id,
            department: req.body.dept,
            position: req.body.position,
            qualification: req.body.qual,
            experience: req.body.exp,
            notes: req.body.notes
        }
    } else {
        updateData = {
            full_name: req.body.name,
            email: req.body.email,
            contact_number: req.body.contact,
            date_of_birth: req.body.dob,
            gender: req.body.gender,
            age: req.body.age,
            address: req.body.address,
            pincode: req.body.pincode,
            employee_id: req.body.id,
            department: req.body.dept,
            position: req.body.position,
            qualification: req.body.qual,
            experience: req.body.exp,
            notes: req.body.notes,
            avatar: req.file.filename
        }
    }

    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).send('Employee details not found');
        }

        res.redirect("/admin/employee/manage");
    } catch (error) {
        res.status(500).send('Error updating Employee details');
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).send('Employee not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/admin/records/appointment", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const appointments = await Appointment.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("appointment_records", { admin, appointments, userType });
});

app.get("/admin/records/appointment/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = app.app_doc;
    const admin = await fetchAdminDetails(req.user.email);
    let doc = await Doctor.findOne({ full_name: doctorName });
    res.render("appointment", { admin, app, doc, userType });
});

app.get("/admin/records/patient", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("patient_records", { admin, patients, userType });
});

app.get("/admin/records/patient/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let doctorName = patient.doc_assign;
    let doc = await Doctor.findOne({ full_name: doctorName });
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let discharge = await Discharge.findOne({ patient_id: req.params.id });
    const admin = await fetchAdminDetails(req.user.email);
    res.render("patient_final_record", { admin, patient, doc, lab, discharge, userType });
});

app.get("/admin/payroll/add", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const payrolls = await Payroll.find({});
    const admin = await fetchAdminDetails(req.user.email);

    // Create a Set of employee IDs that have salaries
    const employeeWithSalaries = new Set(payrolls.filter(p => p.salary !== '').map(p => p.employee_id));

    // Filter employees that do not have a salary assigned
    const employeesWithoutSalaries = employees.filter(e => !employeeWithSalaries.has(e.employee_id));

    res.render("add_payroll", { admin, payrolls, employees: employeesWithoutSalaries, userType });
});

app.route("/admin/payroll/add/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const emp = await Employee.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("add_new_payroll", { admin, emp, userType });
}).post(isAdminOrDoctor, async (req, res) => {
    const newPayroll = new Payroll(req.body);
    try {
        await newPayroll.save();
        res.status(201).redirect("/admin/payroll/manage")
    } catch (error) {
        res.status(400).redirect("/admin/payroll/add");
    }
});

app.get("/admin/payroll/manage", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const payrolls = await Payroll.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("manage_payroll", { admin, payrolls, userType });
});

app.route("/admin/payroll/manage/:id").get(isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    let payroll = await Payroll.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("update_payroll", { admin, payroll, userType });
}).patch(isAdminOrDoctor, async (req, res) => {
    try {
        const updatedPayroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            {
                full_name: req.body.name,
                email: req.body.email,
                employee_id: req.body.id,
                salary: req.body.salary,
                payment_status: req.body.status,
                payroll_desc: req.body.notes,
            },
            { new: true, runValidators: true }
        );

        if (!updatedPayroll) {
            return res.status(404).send('Employee Payroll details not found');
        }

        res.redirect("/admin/payroll/manage");
    } catch (error) {
        res.status(500).send('Error updating Employee payroll details');
    }
}).delete(isAdminOrDoctor, async (req, res) => {
    try {
        const deletedPayroll = await Payroll.findByIdAndDelete(req.params.id);
        if (!deletedPayroll) {
            return res.status(404).send('Payroll not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/admin/payroll/generate", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const employees = await Payroll.find({});
    const admin = await fetchAdminDetails(req.user.email);
    res.render("generate_payroll", { admin, employees, userType });
});

app.get("/admin/payroll/generate/:id", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const payroll = await Payroll.findById(req.params.id);
    const admin = await fetchAdminDetails(req.user.email);
    res.render("employee_payslip", { admin, payroll, userType });
});

app.get("/admin/survey", isAdminOrDoctor, async (req, res) => {
    const userType = req.session.userType;
    const admin = await fetchAdminDetails(req.user.email);
    res.render("survey", { admin, userType });
});
// admin section end -------------------------------------------


// doctor section start -----------------------------------------
app.route("/doctor/dashboard").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const appointments = await Appointment.find({});
    const patients = await Patient.find({});
    const pharmacies = await Pharmacy.find({});
    const labReports = await LabReport.find({});
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("doctor", { userType, patients, appointments, pharmacies, labReports, doctor });
});



app.route("/doctor/appointment/create").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctors = await Doctor.find({});
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("create_app", { doctors, userType, doctor });
}).post(isAdminOrDoctor, async (req, res) => {
    const newAppoint = new Appointment(req.body);

    try {
        await newAppoint.save();
        res.status(201).redirect('/doctor/appointment/manage');
    } catch (error) {
        res.status(400).redirect('/doctor/appointment/create');
    }
});


app.get("/doctor/appointment/manage", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("manage_app", { appointments, userType, doctor });
});

app.route("/doctor/appointment/manage/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let app = await Appointment.findById(req.params.id);
    const doctors = await Doctor.find({});
    res.render("update_app", { app, doctors, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                contact: req.body.contact,
                dob: req.body.dob,
                age: req.body.age,
                gender: req.body.gender,
                address: req.body.address,
                pincode: req.body.pincode,
                app_doc: req.body.app_doc,
                app_date: req.body.app_date,
                reason: req.body.reason,
                notes: req.body.notes,
                status: req.body.app_sts,
            },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) {
            return res.status(404).send('Appointment not found');
        }

        res.redirect("/doctor/appointment/manage");
    } catch (error) {
        res.status(500).send('Error updating appointment');
    }
}).delete(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).send('Appointment not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/doctor/prescription/add", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    const prescriptions = await Prescription.find({});
    res.render("add_presc", { prescriptions, patients, userType, doctor });
});

app.route("/doctor/prescription/add/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("add_new_presc", { patient, userType, doctor });
}).post(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const newPrescription = new Prescription(req.body);
    try {
        await newPrescription.save();
        res.status(201).redirect("/doctor/prescription/q");
    } catch (error) {
        res.status(400).redirect("/doctor/prescription/add");
    }
});

app.get("/doctor/prescription/q", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const prescriptions = await Prescription.find({});
    const patients = await Patient.find({});
    res.render("view_presc", { patients, prescriptions, userType, doctor });
});

app.get("/doctor/prescription/q/:id", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let presc = await Prescription.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("prescription", { patient, presc, userType, doctor });
});

app.get("/doctor/prescription/manage", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let prescriptions = await Prescription.find({});
    let patients = await Patient.find({});
    res.render("manage_presc", { patients, prescriptions, userType, doctor });
});

app.route("/doctor/prescription/manage/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let presc = await Prescription.findById(req.params.id);
    res.render("update_presc", { presc, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedPrescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                age: req.body.age,
                address: req.body.address,
                type: req.body.type,
                ailment: req.body.ailment,
                notes: req.body.notes
            },
            { new: true, runValidators: true }
        );

        if (!updatedPrescription) {
            return res.status(404).send('prescription not found');
        }

        res.redirect("/doctor/prescription/q");
    } catch (error) {
        res.status(500).send('Error updating prescription');
    }
}).delete(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!deletedPrescription) {
            return res.status(404).send('Prescription not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.route("/doctor/pharmacy/add").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_pharma", { userType, doctor });
}).post(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const newPharmacy = new Pharmacy(req.body);
    try {
        await newPharmacy.save();
        res.status(201).redirect("/doctor/pharmacy/manage");
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/doctor/pharmacy/manage", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const pharmacies = await Pharmacy.find({});
    res.render("manage_pharma", { pharmacies, userType, doctor });
});

app.route("/doctor/pharmacy/manage/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let pharma = await Pharmacy.findById(req.params.id);
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_pharma", { pharma, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                quantity: req.body.quant,
                category: req.body.categ,
                vendor: req.body.vendor,
                barcode_number: req.body.bc,
                description: req.body.description
            },
            { new: true, runValidators: true }
        );

        if (!updatedPharmacy) {
            return res.status(404).send('Pharmacy not found');
        }

        res.redirect("/doctor/pharmacy/manage");
    } catch (error) {
        res.status(500).redirect("/doctor/pharmacy/manage");
    }
}).delete(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const deletedPharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        if (!deletedPharmacy) {
            return res.status(404).send('Pharmacy not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/doctor/lab/tests", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_test", { patients, userType, doctor });
});

app.route("/doctor/lab/tests/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    res.render("add_lab_test", { patient, lab, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedVitals = await LabReport.findOneAndUpdate(
            { patient_id: req.params.id },
            {
                name: req.body.name,
                ailment: req.body.ailment,
                patient_id: req.body.id,
                lab_tests: req.body.tests,
            },
            { new: true, runValidators: true }
        );

        if (!updatedVitals) {
            return res.status(404).send('Vitals data not found');
        }

        res.redirect("/doctor/lab/tests");
    } catch (error) {
        res.status(500).send('Error updating Vitals data');
    }
});

app.get("/doctor/lab/results", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { patients, labs, userType, doctor });
});

app.route("/doctor/lab/results/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const lab = await LabReport.findById(req.params.id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_lab_result", { lab, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedLabResult = await LabReport.findByIdAndUpdate(
            req.params.id,
            {
                result_date: req.body.result_date,
                lab_results: req.body.results
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabResult) {
            return res.status(404).send('Lab Results not found');
        }

        res.redirect("/doctor/lab/results");
    } catch (error) {
        res.status(500).send('Error updating Lab Results');
    }
});

app.get("/doctor/patient/vitals", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_vitals", { patients, labs, userType, doctor });
});

app.route("/doctor/patient/vitals/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_patient_vitals", { lab, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedLabTest = await LabReport.findByIdAndUpdate(
            req.params.id,
            {
                heart_rate: req.body.hr,
                blood_pressure: req.body.bp,
                temperature: req.body.temp,
                resp_rate: req.body.resp,
                oxygen_sat: req.body.spo2
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabTest) {
            return res.status(404).send('Lab tests not found');
        }

        res.redirect("/doctor/patient/vitals");
    } catch (error) {
        res.status(500).send('Error updating Lab Tests');
    }
});
app.get("/doctor/lab/reports", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { patients, labs, userType, doctor });
});

app.get("/doctor/lab/reports/:id", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("view_lab_report", { patient, lab, userType, doctor });
});

app.route("/doctor/patient/register").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("register_patient", { userType, doctor });
}).post(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const newPatient = new Patient(req.body);
    try {
        await newPatient.save();
        res.status(201).redirect("/doctor/patient/q")
    } catch (error) {
        res.status(400).redirect("/doctor/patient/q");
    }
});

app.get("/doctor/patient/q", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("view_patient", { patients, userType, doctor });
});

app.get("/doctor/patient/q/:id", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_profile", { patient, lab, userType, doctor });
});

app.get("/doctor/patient/manage", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("manage_patient", { patients, userType, doctor });
});

app.route("/doctor/patient/manage/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findById(req.params.id);
    const doctors = await Doctor.find({});
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_patient", { patient, doctors, userType, doctor });
}).patch(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                patient_id: req.body.id,
                email: req.body.email,
                dob: req.body.dob,
                age: req.body.age,
                gender: req.body.gender,
                contact: req.body.contact,
                emergency_contact: req.body.em_contact,
                address: req.body.address,
                marital_status: req.body.marital_sts,
                ailment: req.body.ailment,
                type: req.body.type,
                treat_status: req.body.status,
                doc_assign: req.body.assign_doc
            },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).send('Patient details not found');
        }

        res.redirect("/doctor/patient/manage");
    } catch (error) {
        res.status(500).send('Error updating Patient details');
    }
}).delete(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        await LabReport.findOneAndDelete({ patient_id: deletedPatient.patient_id });

        if (!deletedPatient) {
            return res.status(404).send('Patient not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/doctor/patient/discharge", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("discharge_patient", { patients, userType, doctor });
});

app.route("/doctor/patient/discharge/:id").get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("discharge_form", { patient, userType, doctor });
}).post(isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const newDischarge = new Discharge(req.body);
    try {
        await newDischarge.save();
        await Patient.findOneAndUpdate(
            { patient_id: req.params.id },
            {
                treat_status: "Completed",
                is_discharged: 1,
            },
            { new: true, runValidators: true }
        );

        res.status(201).redirect("/doctor/patient/discharge");
    } catch (error) {
        res.status(400).redirect("/doctor/patient/discharge");
    }
});

app.get("/doctor/records/appointment", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("appointment_records", { appointments, userType, doctor });
});

app.get("/doctor/records/appointment/:id", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = app.app_doc;
    let doc = await Doctor.findOne({ full_name: doctorName });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("appointment", { app, doc, userType, doctor });
});

app.get("/doctor/records/patient", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("patient_records", { patients, userType, doctor });
});

app.get("/doctor/records/patient/:id", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let doctorName = patient.doc_assign;
    let doc = await Doctor.findOne({ full_name: doctorName });
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let discharge = await Discharge.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_final_record", { patient, doc, lab, discharge, userType, doctor });
});

app.get("/doctor/survey", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("survey", { userType, doctor });
});

app.route("/doctor/profile")
    .get(isAdminOrDoctor, isAuthenticated, async (req, res) => {
        const userType = req.session.userType;
        const userEmail = req.user.email;
        const doctor = await fetchDoctorDetails(userEmail);
        res.render("doc_profile_acc", { doctor, userType });
    })
    .patch(isAdminOrDoctor, isAuthenticated, upload, async (req, res) => {
        let updateData = {
            bio: req.body.bio,
            contact_number: req.body.contact,
            address: req.body.address,
            pincode: req.body.pincode,
            username: req.body.username
        };

        try {
            if (req.body.pwd && req.body.pwd.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.pwd, salt);
                updateData.password = hashedPassword;
            }

            if (req.file) {
                updateData.avatar = req.file.filename;
            }

            const updatedDoctor = await Doctor.findOneAndUpdate(
                { email: req.user.email },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedDoctor) {
                return res.status(404).send('Doctor not found');
            }

            res.redirect("/doctor/profile");
        } catch (error) {
            console.error("Error updating doctor:", error);
            res.status(500).send('Internal Server Error');
        }
    });


// doctor section end ------------------------------------------

//Logout Route--------------------------------------------------
app.post("/logout", isAdminOrDoctor, isAuthenticated, async (req, res) => {
    if (req.user.role === 'doctor') {
        await Doctor.findOneAndUpdate({ email: req.user.email }, { status: 'Offline' });
    }
    res.clearCookie("token");
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Unable to log out');
        }
        setTimeout(() => {
            res.redirect("/login");
        }, 1500)
    })
});


// port listening console log
app.listen(5000, () => {
    console.log("Port is listening on port 5000");
});

// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});

//protected url middleware
function isLoggedIn(requiredRole) {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token || token === "") {
            return res.status(401).redirect('/login');
        }

        try {
            const data = jwt.verify(token, config.secret_key);
            if (data.role !== requiredRole) {
                return res.status(403).redirect('/login');
            }
            req.user = data;
            next();
        } catch (error) {
            return res.status(401).redirect('/login');
        }
    };
}

//protected url middleware only for logout
function isAdminOrDoctor(req, res, next) {
    const token = req.cookies.token;

    if (!token || token === "") {
        return res.status(401).redirect('/login');
    }

    try {
        const data = jwt.verify(token, config.secret_key);
        if (data.role !== 'admin' && data.role !== 'doctor') {
            return res.status(403).redirect('/login');
        }
        req.user = data;
        next();
    } catch (error) {
        return res.status(401).redirect('/login');
    }
}


// Assuming you have a function fetchDoctorDetails to get doctor details from the database
async function isAuthenticated(req, res, next) {
    if (req.user.email) {
        try {
            const doctor = await fetchDoctorDetails(req.user.email);
            if (doctor) {
                res.locals.doctor = doctor;
                return next(); // User is authenticated and exists in the database
            } else {
                // User's credentials have been deleted
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                    res.redirect('/login');
                });
            }
        } catch (err) {
            console.error('Error fetching doctor details:', err);
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
                res.redirect('/login');
            });
        }
    } else {
        res.redirect('/login'); // User is not authenticated
    }
}



//Function to fetch logged in doctor information
async function fetchDoctorDetails(userEmail) {
    const doctor = await Doctor.findOne({ email: userEmail });
    return doctor;
};

//Function to fetch logged in doctor information
async function fetchAdminDetails(adminEmail) {
    const admin = await Admin.findOne({ email: adminEmail });
    return admin;
};

