const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const ejs = require("ejs");
const methodOverride = require('method-override');

//database files acquiring
require("./src/db/conn");
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
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to set user type based on URL path
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        req.session.userType = 'admin';
    } else if (req.path.startsWith('/doctor')) {
        req.session.userType = 'doctor';
    }
    next();
});

// Middleware to fetch doctor information
app.use(async (req, res, next) => {
    if (req.session.userEmail) {
        const userEmail = req.session.userEmail;
        const doctor = await fetchDoctorDetails(userEmail); // Implement fetchDoctorDetails function
        res.locals.doctor = doctor; // Make doctor information available in all EJS templates
    }
    next();
});


//Function to fetch logged in doctor information
function fetchDoctorDetails(userEmail) {
    const doctor = Doctor.find({ email: userEmail });
    return doctor;
}


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// admin section start-----------------------------------------
app.route("/admin/dashboard")
    .get(async (req, res) => {
        const userType = req.session.userType;
        const appointments = await Appointment.find({});
        const pharmacies = await Pharmacy.find({});
        const patients = await Patient.find({});
        const employees = await Employee.find({});
        const doctors = await Doctor.find({});
        res.render("admin", { employees, patients, appointments, doctors, pharmacies, userType });
    })
    .post(async (req, res) => {
        try {
            let { username, password } = req.body;
            console.log(username, password);
            res.redirect("/admin/dashboard");
        } catch (error) {
            res.status(400).send("Admin login failed");
        }
    });

app.route("/admin/appointment/create").get(async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    res.render("create_app", { doctors, userType });
}).post(async (req, res) => {
    const newAppoint = new Appointment(req.body);

    try {
        await newAppoint.save();
        res.status(201).redirect('/admin/appointment/manage');
    } catch (error) {
        res.status(400).redirect('/admin/appointment/create');
    }
});

app.get("/admin/appointment/manage", async (req, res) => {
    const appointments = await Appointment.find({});
    const userType = req.session.userType;
    res.render("manage_app", { appointments, userType });
});

app.route("/admin/appointment/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let doctors = await Doctor.find({});
    let app = await Appointment.findById(req.params.id);
    res.render("update_app", { app, doctors, userType });
}).patch(async (req, res) => {
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

        setTimeout(() => {
            res.redirect("/admin/appointment/manage");
        }, 1500);
    } catch (error) {
        res.status(500).redirect("/admin/appointment/manage");
    }
});

app.route("/admin/pharmacy/add").get((req, res) => {
    const userType = req.session.userType;
    res.render("add_pharma", { userType });
}).post(async (req, res) => {
    const newPharmacy = new Pharmacy(req.body);
    try {
        await newPharmacy.save();
        res.status(201).redirect('/admin/pharmacy/manage');
    } catch (error) {
        res.status(400).redirect('/admin/pharmacy/add');
    }
});

app.get("/admin/pharmacy/manage", async (req, res) => {
    const userType = req.session.userType;
    const pharmacies = await Pharmacy.find({});
    res.render("manage_pharma", { pharmacies, userType });
});

app.route("/admin/pharmacy/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let pharma = await Pharmacy.findById(req.params.id);
    res.render("update_pharma", { pharma, userType });
}).patch(async (req, res) => {
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

        setTimeout(() => {
            res.redirect("/admin/pharmacy/manage");
        }, 1500);
    } catch (error) {
        setTimeout(() => {
            res.status(500).redirect("/admin/pharmacy/manage");
        }, 1500);
    }
});

app.get("/admin/prescription/add", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("add_presc", { patients, userType });
});

app.route("/admin/prescription/add/:id")
    .get(async (req, res) => {
        const userType = req.session.userType;
        const patient = await Patient.findOne({ patient_id: req.params.id });
        res.render("add_new_presc", { patient, userType });
    })
    .post(async (req, res) => {
        const newPrescription = new Prescription(req.body);
        try {
            await newPrescription.save();
            res.status(201).redirect("/admin/prescription/q");
        } catch (error) {
            res.status(400).redirect("/admin/prescription/add");
        }
    });


app.get("/admin/prescription/q", async (req, res) => {
    const userType = req.session.userType;
    const prescriptions = await Prescription.find({});
    res.render("view_presc", { prescriptions, userType });
});

app.get("/admin/prescription/q/:id", async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let presc = await Prescription.findOne({ patient_id: req.params.id });
    res.render("prescription", { patient, presc, userType });
});

app.get("/admin/prescription/manage", async (req, res) => {
    const userType = req.session.userType;
    let prescriptions = await Prescription.find({});
    res.render("manage_presc", { prescriptions, userType });
});

app.route("/admin/prescription/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let presc = await Prescription.findById(req.params.id);
    res.render("update_presc", { presc, userType });
}).patch(async (req, res) => {
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

        setTimeout(() => {
            res.redirect("/admin/prescription/q");
        }, 1500);
    } catch (error) {
        res.status(500).send('Error updating prescription');
    }
});

app.get("/admin/lab/tests", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("patient_lab_test", { patients, userType });
})

app.route("/admin/lab/tests/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    res.render("add_lab_test", { patient, lab, userType });
}).patch(async (req, res) => {
    try {
        const updatedVitals = await LabReport.findOneAndUpdate(
            { patient_id: req.params.id },
            {
                name: req.body.name,
                ailment: req.body.ailment,
                patient_id: req.body.id,
                lab_tests: req.body.tests,
            },
            { new: false, runValidators: true }
        );

        if (!updatedVitals) {
            return res.status(404).send('Vitals data not found');
        }

        res.redirect("/admin/patient/vitals");
    } catch (error) {
        res.status(500).send('Error updating Vitals data');
    }
});

app.get("/admin/lab/results", async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    res.render("patient_lab_result", { labs, userType });
})

app.route("/admin/lab/results/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    res.render("add_lab_result", { lab, userType });
}).patch(async (req, res) => {
    try {
        const updatedLabResult = await LabReport.findByIdAndUpdate(
            req.params.id,
            {
                result_date: req.body.result_date,
                lab_results: req.body.results
            },
            { new: false, runValidators: true }
        );

        if (!updatedLabResult) {
            return res.status(404).send('Lab Results not found');
        }

        setTimeout(() => {
            res.redirect("/admin/lab/results");
        }, 1500);
    } catch (error) {
        res.status(500).send('Error updating Lab Results');
    }
});

app.get("/admin/patient/vitals", async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    res.render("patient_vitals", { labs, userType });
});

app.route("/admin/patient/vitals/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    res.render("add_patient_vitals", { lab, userType });
}).patch(async (req, res) => {
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
            { new: false, runValidators: true }
        );

        if (!updatedLabTest) {
            return res.status(404).send('Lab tests not found');
        }

        setTimeout(() => {
            res.redirect("/admin/patient/vitals");
        }, 1500);
    } catch (error) {
        res.status(500).send('Error updating Lab Tests');
    }
});

app.get("/admin/lab/reports", async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    res.render("lab_reports", { labs, userType });
});

app.get("/admin/lab/reports/:id", async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("view_lab_report", { lab, patient, userType });
});

app.get("/admin/doctor/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_doctor", { userType });
});

app.route("/admin/doctor/q").get(async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    res.render("view_doctor", { doctors, userType });
}).post(async (req, res) => {
    const newDoctor = new Doctor(req.body);
    try {
        await newDoctor.save();
        res.status(201).redirect("/admin/doctor/q")
    } catch (error) {
        res.status(400).redirect("/admin/doctor/add");
    }
});

app.get("/admin/doctor/q/:id", async (req, res) => {
    const userType = req.session.userType;
    let doctor = await Doctor.findById(req.params.id);
    res.render("doctor_profile", { doctor, userType });
});

app.get("/admin/doctor/manage", async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    res.render("manage_doctor", { doctors, userType });
});

app.route("/admin/doctor/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const doctor = await Doctor.findById(req.params.id)
    res.render("update_doctor", { doctor, userType });
}).patch(async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
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
                password: req.body.pwd,
                notes: req.body.note,
                pic: req.body.pic,
            },
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).send('Lab tests not found');
        }

        res.redirect("/admin/doctor/manage");
    } catch (error) {
        res.status(500).send('Error updating Lab Tests');
    }
});

app.route("/admin/patient/register").get((req, res) => {
    const userType = req.session.userType;
    res.render("register_patient", { userType });
}).post(async (req, res) => {
    const newPatient = new Patient(req.body);
    try {
        await newPatient.save();
        res.status(201).redirect("/admin/patient/q")
    } catch (error) {
        res.status(400).redirect("/admin/patient/q");
    }
});

app.get("/admin/patient/q", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("view_patient", { patients, userType });
});

app.get("/admin/patient/q/:id", async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    res.render("patient_profile", { patient, lab, userType });
});

app.get("/admin/patient/manage", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("manage_patient", { patients, userType });
});

app.route("/admin/patient/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findById(req.params.id);
    const doctors = await Doctor.find({});
    res.render("update_patient", { patient, doctors, userType });
}).patch(async (req, res) => {
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
});

app.get("/admin/patient/discharge", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("discharge_patient", { patients, userType });
});

app.route("/admin/patient/discharge/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("discharge_form", { patient, userType });
}).post(async (req, res) => {
    const newDischarge = new Discharge(req.body);
    try {
        await newDischarge.save();
        await Patient.findOneAndUpdate(
            { patient_id: req.params.id },
            { treat_status: "Completed" },
            { new: true, runValidators: true }
        );
        res.status(201).redirect("/admin/patient/discharge");
    } catch (error) {
        res.status(400).redirect("/admin/patient/discharge");
    }
});

app.route("/admin/employee/add").get((req, res) => {
    const userType = req.session.userType;
    res.render("add_employee", { userType });
}).post(async (req, res) => {
    const newEmployee = new Employee(req.body);
    try {
        await newEmployee.save();
        res.status(201).redirect("/admin/employee/q")
    } catch (error) {
        res.status(400).redirect("/admin/employee/q");
    }
});

app.get("/admin/employee/q", async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    res.render("view_employee", { employees, userType });
});

app.get("/admin/employee/q/:id", async (req, res) => {
    const userType = req.session.userType;
    const employee = await Employee.findById(req.params.id);
    res.render("employee_profile", { employee, userType });
});

app.get("/admin/employee/manage", async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    res.render("manage_employee", { employees, userType });
});

app.route("/admin/employee/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const employee = await Employee.findById(req.params.id);
    res.render("update_employee", { employee, userType });
}).patch(async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
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
                pic: req.body.pic
            },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).send('Employee details not found');
        }

        res.redirect("/admin/employee/manage");
    } catch (error) {
        res.status(500).send('Error updating Employee details');
    }
});

app.get("/admin/records/appointment", async (req, res) => {
    const userType = req.session.userType;
    const appointments = await Appointment.find({});
    res.render("appointment_records", { appointments, userType });
});

app.get("/admin/records/appointment/:id", async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = app.app_doc;
    let doc = await Doctor.findOne({ full_name: doctorName });
    res.render("appointment", { app, doc, userType });
});

app.get("/admin/records/patient", async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    res.render("patient_records", { patients, userType });
});

app.get("/admin/records/patient/:id", async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let doctorName = patient.doc_assign;
    let doc = await Doctor.findOne({ full_name: doctorName });
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let discharge = await Discharge.findOne({ patient_id: req.params.id });
    res.render("patient_final_record", { patient, doc, lab, discharge, userType });
});

app.get("/admin/payroll/add", async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    res.render("add_payroll", { employees, userType });
});

app.route("/admin/payroll/add/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const emp = await Employee.findById(req.params.id);
    res.render("add_new_payroll", { emp, userType });
}).post(async (req, res) => {
    const newPayroll = new Payroll(req.body);
    try {
        await newPayroll.save();
        res.status(201).redirect("/admin/payroll/manage")
    } catch (error) {
        res.status(400).redirect("/admin/payroll/add");
    }
});

app.get("/admin/payroll/manage", async (req, res) => {
    const userType = req.session.userType;
    const payrolls = await Payroll.find({});
    res.render("manage_payroll", { payrolls, userType });
});

app.route("/admin/payroll/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let payroll = await Payroll.findById(req.params.id);
    res.render("update_payroll", { payroll, userType });
}).patch(async (req, res) => {
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
});

app.get("/admin/payroll/generate", async (req, res) => {
    const userType = req.session.userType;
    const employees = await Payroll.find({});
    res.render("generate_payroll", { employees, userType });
});

app.get("/admin/payroll/generate/:id", async (req, res) => {
    const userType = req.session.userType;
    const payroll = await Payroll.findById(req.params.id);
    res.render("employee_payslip", { payroll, userType });
});

app.get("/admin/survey", (req, res) => {
    const userType = req.session.userType;
    res.render("survey", { userType });
});
// admin section end -------------------------------------------

// doctor section start -----------------------------------------
app.route("/doctor/dashboard")
    .post(async (req, res) => {
        try {
            let { email, password } = req.body;
            console.log(email, password); // Consider validating the email and password
            req.session.userEmail = email;
            req.session.userType = 'doctor';
            res.redirect("/doctor/dashboard");
        } catch (error) {
            res.status(400).send("Doctor login failed");
        }
    })
    .get(async (req, res) => {
        const appointments = await Appointment.find({});
        const patients = await Patient.find({});
        const pharmacies = await Pharmacy.find({});
        const labReports = await LabReport.find({});
        const userType = req.session.userType;
        const userEmail = req.session.userEmail;
        const doctor = await fetchDoctorDetails(userEmail);
        res.render("doctor", { userType, patients, appointments, pharmacies, labReports, doctor });
    });



app.route("/doctor/appointment/create").get(async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("create_app", { doctors, userType, doctor });
}).post(async (req, res) => {
    const newAppoint = new Appointment(req.body);

    try {
        await newAppoint.save();
        setTimeout(() => {
            res.status(201).redirect("/doctor/appointment/manage");
        }, 1500);
    } catch (error) {
        res.status(400).send(error);
    }
});


app.get("/doctor/appointment/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("manage_app", { appointments, userType, doctor });
});

app.route("/doctor/appointment/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let app = await Appointment.findById(req.params.id);
    res.render("update_app", { app, doctors, userType, doctor });
}).patch(async (req, res) => {
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

        setTimeout(() => {
            res.redirect("/doctor/appointment/manage");
        }, 1500);
    } catch (error) {
        res.status(500).send('Error updating appointment');
    }
});

app.get("/doctor/prescription/add", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_presc", { patients, userType, doctor });
});

app.route("/doctor/prescription/add/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let patient = patients.find(p => p.id === id);
    res.render("add_new_presc", { patient, userType, doctor });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/prescription/add");
    }, 1500);
})

app.get("/doctor/prescription/q", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("view_presc", { patients, userType, doctor });
});

app.get("/doctor/prescription/q/:id", async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    const userEmail = req.session.userEmail;
    let presc = prescriptions.find(p => p.patient_id === id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("prescription", { patient, presc, userType, doctor });
});

app.get("/doctor/prescription/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("manage_presc", { patients, userType, doctor });
});

app.route("/doctor/prescription/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("update_presc", { patient, presc, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/prescription/manage");
    }, 1500);
});

app.route("/doctor/pharmacy/add").get(async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_pharma", { userType, doctor });
}).post(async (req, res) => {
    const newPharmacy = new Pharmacy(req.body);
    try {
        await newPharmacy.save();
        setTimeout(() => {
            res.status(201).redirect("/doctor/pharmacy/manage");
        }, 1500);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/doctor/pharmacy/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    const pharmacies = await Pharmacy.find({});
    res.render("manage_pharma", { pharmacies, userType, doctor });
});

app.route("/doctor/pharmacy/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let pharma = await Pharmacy.findById(req.params.id);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_pharma", { pharma, userType, doctor });
}).patch(async (req, res) => {
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

        setTimeout(() => {
            res.redirect("/doctor/pharmacy/manage");
        }, 1500);
    } catch (error) {
        res.status(500).send('Error updating Pharmacy');
    }
});

app.get("/doctor/lab/tests", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_lab_test", { patients, userType, doctor });
});

app.route("/doctor/lab/tests/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    let lab = labReports.find(r => r.id === id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_lab_test", { lab, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/lab/tests");
    }, 1500);
});

app.get("/doctor/lab/results", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_lab_result", { patients, userType, doctor });
});

app.route("/doctor/lab/results/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    let lab = labReports.find(r => r.id === id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("add_lab_result", { lab, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/lab/results");
    }, 1500);
});

app.get("/doctor/patient/vitals", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_vitals", { patients, userType, doctor });
});

app.route("/doctor/patient/vitals/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let lab = labReports.find(l => l.id === id);
    res.render("add_patient_vitals", { patient, lab, userType, doctor });
}).patch((req, res) => {
    console.log(Date.now());
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/patient/vitals");
    }, 1500);
});

app.get("/doctor/lab/reports", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("lab_reports", { patients, userType, doctor });
});

app.get("/doctor/lab/reports/:id", async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let lab = labReports.find(l => l.id === id);
    res.render("view_lab_report", { patient, lab, userType, doctor });
});

app.route("/doctor/patient/register").get(async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("register_patient", { userType, doctor });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/patient/q");
    }, 1500);
})

app.get("/doctor/patient/q", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("view_patient", { patients, userType, doctor });
});

app.get("/doctor/patient/q/:id", async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let lab = labReports.find(d => d.id === id);
    res.render("patient_profile", { patient, lab, userType, doctor });
});

app.get("/doctor/patient/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("manage_patient", { patients, userType, doctor });
});

app.route("/doctor/patient/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    let patient = patients.find(p => p.id === id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_patient", { patient, doctors, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/patient/manage");
    }, 1500);
});

app.get("/doctor/patient/discharge", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("discharge_patient", { patients, userType, doctor });
});

app.route("/doctor/patient/discharge/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    let patient = patients.find(p => p.id === id);
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("discharge_form", { patient, userType, doctor });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/patient/discharge");
    }, 1500);
});

app.get("/doctor/records/appointment", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("appointment_records", { appointments, userType, doctor });
});

app.get("/doctor/records/appointment/:id", async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    let doctorName = app.preferred_doctor;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let doc = doctors.find(d => d.full_name === doctorName);
    res.render("appointment", { app, doc, userType, doctor });
});

app.get("/doctor/records/patient", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_records", { patients, userType, doctor });
});

app.get("/doctor/records/patient/:id", async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let doctorName = patient.doctor_assigned;
    let doc = doctors.find(d => d.full_name === doctorName);
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let lab = labReports.find(r => r.id === id);
    res.render("patient_final_record", { patient, doc, lab, userType, doctor });
});

app.get("/doctor/survey", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("survey", { userType, doctor });
});

app.route("/doctor/profile").get((req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = fetchDoctorDetails(userEmail);
    res.render("doc_profile_acc", { doctor, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/profile");
    }, 1500);
})

// doctor section end ------------------------------------------




// port listening console log
app.listen(5000, () => {
    console.log("Port is listening on port 5000");
});

// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});

