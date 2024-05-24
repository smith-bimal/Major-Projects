const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const ejs = require("ejs");
const methodOverride = require('method-override');

//Demo database requiring
const doctors = require("./src/db/Doctors-demo.json");
const employees = require("./src/db/Employees-demo.json");
const patients = require("./src/db/Patients-demo.json");
const appointments = require("./src/db/Appointment-demo.json");
const pharmacies = require("./src/db/Pharma-demo.json");
const prescriptions = require("./src/db/Patients-presc-demo.json");
const labReports = require("./src/db/lab-data-demo.json");

require("./src/db/conn");
const AdminLogin = require("./src/models/admin_login");
const DoctorLogin = require("./src/models/doctor_login");

let port = process.env.PORT || 5000;

const static_path = path.join(__dirname, "public");
const template_path = path.join(__dirname, "templates/views");

app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", template_path);
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
        // Fetch doctor details from the database based on userEmail
        const doctor = await fetchDoctorDetails(userEmail); // Implement fetchDoctorDetails function
        res.locals.doctor = doctor; // Make doctor information available in all EJS templates
    }
    next();
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// admin section start-----------------------------------------
app.get("/admin/dashboard", (req, res) => {
    const userType = req.session.userType;
    res.render("admin", { employees, patients, appointments, doctors, pharmacies, userType });
});

app.post("/admin/dashboard", async (req, res) => {
    try {
        let { username, password } = req.body;
        console.log(username, password);
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.status(400).send("Admin login failed");
    }
});

app.get("/admin/appointment/create", (req, res) => {
    const userType = req.session.userType;
    res.render("create_app", { doctors, userType });
});

app.get("/admin/appointment/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_app", { appointments, userType });
});

app.get("/admin/appointment/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    res.render("update_app", { app, doctors, userType });
});

app.get("/admin/pharmacy/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_pharma", { userType });
});

app.get("/admin/pharmacy/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_pharma", { pharmacies, userType });
});

app.get("/admin/pharmacy/manage/:bc", (req, res) => {
    const userType = req.session.userType;
    let bc = req.params.bc;
    let pharma = pharmacies.find(p => p.pharmaceutical_barcode === Number(bc));
    res.render("update_pharma", { pharma, userType });
});

app.get("/admin/prescription/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_presc", { patients, userType });
});

app.get("/admin/prescription/add/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("add_new_presc", { patient, userType });
});

app.get("/admin/prescription/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_presc", { patients, userType });
});

app.get("/admin/prescription/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("prescription", { patient, presc, userType });
});

app.get("/admin/prescription/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_presc", { patients, userType });
});

app.get("/admin/prescription/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("update_presc", { patient, presc, userType });
});

app.get("/admin/lab/tests", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_test", { patients, userType });
});

app.get("/admin/lab/tests/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_test", { lab, userType });
});

app.get("/admin/lab/results", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_result", { patients, userType });
});

app.get("/admin/lab/results/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_result", { lab, userType });
});

app.get("/admin/patient/vitals", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_vitals", { patients, userType });
});

app.get("/admin/patient/vitals/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(l => l.id === id);
    res.render("add_patient_vitals", { patient, lab, userType });
});

app.get("/admin/lab/reports", (req, res) => {
    const userType = req.session.userType;
    res.render("lab_reports", { patients, userType });
});

app.get("/admin/lab/reports/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(l => l.id === id);
    res.render("view_lab_report", { patient, lab, userType });
});

app.get("/admin/doctor/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_doctor", { userType });
});

app.get("/admin/doctor/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_doctor", { doctors, userType });
});

app.get("/admin/doctor/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let doctor = doctors.find(d => d.id === id);
    res.render("doctor_profile", { doctor, userType });
});

app.get("/admin/doctor/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_doctor", { doctors, userType });
});

app.get("/admin/doctor/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let doctor = doctors.find(d => d.id === id);
    res.render("update_doctor", { doctor, userType });
});

app.get("/admin/patient/register", (req, res) => {
    const userType = req.session.userType;
    res.render("register_patient", { userType });
});

app.get("/admin/patient/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_patient", { patients, userType });
});

app.get("/admin/patient/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(d => d.id === id);
    res.render("patient_profile", { patient, lab, userType });
});

app.get("/admin/patient/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_patient", { patients, userType });
});

app.get("/admin/patient/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("update_patient", { patient, doctors, userType });
});

app.get("/admin/patient/discharge", (req, res) => {
    const userType = req.session.userType;
    res.render("discharge_patient", { patients, userType });
});

app.get("/admin/patient/discharge/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("discharge_form", { patient, userType });
});

app.get("/admin/employee/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_employee", { userType });
});

app.get("/admin/employee/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_employee", { employees, userType });
});

app.get("/admin/employee/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let employee = employees.find(e => e.employee_id === id);
    res.render("employee_profile", { employee, userType });
});

app.get("/admin/employee/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_employee", { employees, userType });
});

app.get("/admin/employee/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let employee = employees.find(e => e.employee_id === id);
    res.render("update_employee", { employee, userType });
});

app.get("/admin/records/appointment", (req, res) => {
    const userType = req.session.userType;
    res.render("appointment_records", { appointments, userType });
});

app.get("/admin/records/appointment/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    let doctorName = app.preferred_doctor;
    let doc = doctors.find(d => d.full_name === doctorName);
    res.render("appointment", { app, doc, userType });
});

app.get("/admin/records/patient", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_records", { patients, userType });
});

app.get("/admin/records/patient/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let doctorName = patient.doctor_assigned;
    let doc = doctors.find(d => d.full_name === doctorName);
    let lab = labReports.find(r => r.id === id);
    res.render("patient_final_record", { patient, doc, lab, userType });
});

app.get("/admin/payroll/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_payroll", { employees, userType });
});

app.get("/admin/payroll/add/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let emp = employees.find(e => e.employee_id === id);
    res.render("add_new_payroll", { emp, userType });
});

app.get("/admin/payroll/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_payroll", { employees, userType });
});

app.get("/admin/payroll/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let emp = employees.find(e => e.employee_id === id);
    res.render("update_payroll", { emp, userType });
});

app.get("/admin/payroll/generate", (req, res) => {
    const userType = req.session.userType;
    res.render("generate_payroll", { employees, userType });
});

app.get("/admin/payroll/generate/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let employee = employees.find(e => e.employee_id === id);
    res.render("employee_payslip", { employee, userType });
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
            console.log(email, password);
            req.session.userEmail = email;
            res.redirect("/doctor/dashboard");
        } catch (error) {
            res.status(400).send("Doctor login failed");
        }
    }).get((req, res) => {
        const userType = req.session.userType;
        const userEmail = req.session.userEmail;
        res.render("doctor", { userType, patients, appointments, pharmacies, labReports });
    });


app.get("/doctor/appointment/create", (req, res) => {
    const userType = req.session.userType;
    res.render("create_app", { doctors, userType });
});

app.get("/doctor/appointment/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_app", { appointments, userType });
});

app.get("/doctor/appointment/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    res.render("update_app", { app, doctors, userType });
});

app.get("/doctor/prescription/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_presc", { patients, userType });
});

app.get("/doctor/prescription/add/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("add_new_presc", { patient, userType });
});

app.get("/doctor/prescription/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_presc", { patients, userType });
});

app.get("/doctor/prescription/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("prescription", { patient, presc, userType });
});

app.get("/doctor/prescription/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_presc", { patients, userType });
});

app.get("/doctor/prescription/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("update_presc", { patient, presc, userType });
});

app.get("/doctor/pharmacy/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_pharma", { userType });
});

app.get("/doctor/pharmacy/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_pharma", { pharmacies, userType });
});

app.get("/doctor/pharmacy/manage/:bc", (req, res) => {
    const userType = req.session.userType;
    let bc = req.params.bc;
    let pharma = pharmacies.find(p => p.pharmaceutical_barcode === Number(bc));
    res.render("update_pharma", { pharma, userType });
});

app.get("/doctor/lab/tests", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_test", { patients, userType });
});

app.get("/doctor/lab/tests/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_test", { lab, userType });
});

app.get("/doctor/lab/results", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_result", { patients, userType });
});

app.get("/doctor/lab/results/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_result", { lab, userType });
});

app.get("/doctor/patient/vitals", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_vitals", { patients, userType });
});

app.get("/doctor/patient/vitals/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(l => l.id === id);
    res.render("add_patient_vitals", { patient, lab, userType });
});

app.get("/doctor/lab/reports", (req, res) => {
    const userType = req.session.userType;
    res.render("lab_reports", { patients, userType });
});

app.get("/doctor/lab/reports/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(l => l.id === id);
    res.render("view_lab_report", { patient, lab, userType });
});

app.get("/doctor/patient/register", (req, res) => {
    const userType = req.session.userType;
    res.render("register_patient", { userType });
});

app.get("/doctor/patient/q", (req, res) => {
    const userType = req.session.userType;
    res.render("view_patient", { patients, userType });
});

app.get("/doctor/patient/q/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(d => d.id === id);
    res.render("patient_profile", { patient, lab, userType });
});

app.get("/doctor/patient/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_patient", { patients, userType });
});

app.get("/doctor/patient/manage/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("update_patient", { patient, doctors, userType });
});

app.get("/doctor/patient/discharge", (req, res) => {
    const userType = req.session.userType;
    res.render("discharge_patient", { patients, userType });
});

app.get("/doctor/patient/discharge/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("discharge_form", { patient, userType });
});

app.get("/doctor/records/appointment", (req, res) => {
    const userType = req.session.userType;
    res.render("appointment_records", { appointments, userType });
});

app.get("/doctor/records/appointment/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    let doctorName = app.preferred_doctor;
    let doc = doctors.find(d => d.full_name === doctorName);
    res.render("appointment", { app, doc, userType });
});

app.get("/doctor/records/patient", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_records", { patients, userType });
});

app.get("/doctor/records/patient/:id", (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let doctorName = patient.doctor_assigned;
    let doc = doctors.find(d => d.full_name === doctorName);
    let lab = labReports.find(r => r.id === id);
    res.render("patient_final_record", { patient, doc, lab, userType });
});

app.get("/doctor/survey", (req, res) => {
    const userType = req.session.userType;
    res.render("survey", { userType });
});

app.get("/doctor/profile", (req, res) => {
    const userEmail = req.session.userEmail;
    res.send(fetchDoctorDetails(userEmail));
});

// doctor section end ------------------------------------------

// port listening console log
app.listen(port, () => {
    console.log("Port is listening on", port);
});

// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});

//function to fetch the doctor details according to the email logged in
function fetchDoctorDetails(userEmail) {
    const doctor = doctors.find(d => d.email === userEmail);
    return doctor;
}