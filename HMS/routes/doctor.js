const express = require('express');
const router = express.Router();

const { isAdminOrDoctor, isLoggedIn, isAuthenticated } = require('../utils/middlewares');

const Appointment = require("../src/models/appointmentModel");
const Pharmacy = require("../src/models/pharmacyModel");
const Prescription = require("../src/models/prescriptionModel");
const Patient = require("../src/models/patientModel");
const Doctor = require("../src/models/docModel");
const Employee = require("../src/models/employeeModel");
const LabReport = require("../src/models/labModel");
const Discharge = require("../src/models/dischargeModel");
const Payroll = require("../src/models/payrollModel");
const { fetchDoctorDetails } = require('../utils/helper');

const multer = require('multer');
const bcrypt = require('bcrypt');

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

router.route("/dashboard").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const appointments = await Appointment.find({});
    const patients = await Patient.find({});
    const pharmacies = await Pharmacy.find({});
    const labReports = await LabReport.find({});
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("doctor", { userType, patients, appointments, pharmacies, labReports, doctor });
});



router.route("/appointment/create").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctors = await Doctor.find({});
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("create_app", { doctors, userType, doctor });
}).post(isAdminOrDoctor, isLoggedIn("doctor"), async (req, res) => {
    const newAppoint = new Appointment(req.body);

    try {
        await newAppoint.save();
        res.status(201).redirect('/doctor/appointment/manage');
    } catch (error) {
        res.status(400).redirect('/doctor/appointment/create');
    }
});


router.get("/appointment/manage", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("manage_app", { appointments, userType, doctor });
});

router.route("/appointment/manage/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let app = await Appointment.findById(req.params.id);
    const doctors = await Doctor.find({});
    res.render("update_app", { app, doctors, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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
}).delete(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).send('Appointment not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/prescription/add", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    const prescriptions = await Prescription.find({});
    res.render("add_presc", { prescriptions, patients, userType, doctor });
});

router.route("/prescription/add/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("add_new_presc", { patient, userType, doctor });
}).post(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const newPrescription = new Prescription(req.body);
    try {
        await newPrescription.save();
        res.status(201).redirect("/doctor/prescription/q");
    } catch (error) {
        res.status(400).redirect("/doctor/prescription/add");
    }
});

router.get("/prescription/q", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const prescriptions = await Prescription.find({});
    const patients = await Patient.find({});
    res.render("view_presc", { patients, prescriptions, userType, doctor });
});

router.get("/prescription/q/:id", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let presc = await Prescription.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("prescription", { patient, presc, userType, doctor });
});

router.get("/prescription/manage", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let prescriptions = await Prescription.find({});
    let patients = await Patient.find({});
    res.render("manage_presc", { patients, prescriptions, userType, doctor });
});

router.route("/prescription/manage/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    let presc = await Prescription.findById(req.params.id);
    res.render("update_presc", { presc, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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
}).delete(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    try {
        const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!deletedPrescription) {
            return res.status(404).send('Prescription not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.route("/pharmacy/add").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_pharma", { userType, doctor });
}).post(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const newPharmacy = new Pharmacy(req.body);
    try {
        await newPharmacy.save();
        res.status(201).redirect("/doctor/pharmacy/manage");
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/pharmacy/manage", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const pharmacies = await Pharmacy.find({});
    res.render("manage_pharma", { pharmacies, userType, doctor });
});

router.route("/pharmacy/manage/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let pharma = await Pharmacy.findById(req.params.id);
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_pharma", { pharma, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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
}).delete(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    try {
        const deletedPharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
        if (!deletedPharmacy) {
            return res.status(404).send('Pharmacy not found');
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/lab/tests", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_test", { patients, userType, doctor });
});

router.route("/lab/tests/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    res.render("add_lab_test", { patient, lab, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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

router.get("/lab/results", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { patients, labs, userType, doctor });
});

router.route("/lab/results/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const lab = await LabReport.findById(req.params.id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_lab_result", { lab, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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

router.get("/patient/vitals", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_vitals", { patients, labs, userType, doctor });
});

router.route("/patient/vitals/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_patient_vitals", { lab, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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
router.get("/lab/reports", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { patients, labs, userType, doctor });
});

router.get("/lab/reports/:id", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("view_lab_report", { patient, lab, userType, doctor });
});

router.route("/patient/register").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("register_patient", { userType, doctor });
}).post(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const newPatient = new Patient(req.body);
    try {
        await newPatient.save();
        res.status(201).redirect("/doctor/patient/q")
    } catch (error) {
        res.status(400).redirect("/doctor/patient/q");
    }
});

router.get("/patient/q", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("view_patient", { patients, userType, doctor });
});

router.get("/patient/q/:id", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_profile", { patient, lab, userType, doctor });
});

router.get("/patient/manage", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("manage_patient", { patients, userType, doctor });
});

router.route("/patient/manage/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findById(req.params.id);
    const doctors = await Doctor.find({});
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_patient", { patient, doctors, userType, doctor });
}).patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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
}).delete(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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

router.get("/patient/discharge", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("discharge_patient", { patients, userType, doctor });
});

router.route("/patient/discharge/:id").get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("discharge_form", { patient, userType, doctor });
}).post(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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

router.get("/records/appointment", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("appointment_records", { appointments, userType, doctor });
});

router.get("/records/appointment/:id", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = router.app_doc;
    let doc = await Doctor.findOne({ full_name: doctorName });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("appointment", { app, doc, userType, doctor });
});

router.get("/records/patient", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("patient_records", { patients, userType, doctor });
});

router.get("/records/patient/:id", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
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

router.get("/survey", isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("survey", { userType, doctor });
});

router.route("/profile")
    .get(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, async (req, res) => {
        const userType = req.session.userType;
        const userEmail = req.user.email;
        const doctor = await fetchDoctorDetails(userEmail);
        res.render("doc_profile_acc", { doctor, userType });
    })
    .patch(isAdminOrDoctor, isLoggedIn("doctor"), isAuthenticated, upload, async (req, res) => {
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

module.exports = router;