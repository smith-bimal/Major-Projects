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

// require("./src/db/conn");
// const Admin = require("./src/models/admin_login");

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
        const doctor = await fetchDoctorDetails(userEmail); // Implement fetchDoctorDetails function
        res.locals.doctor = doctor; // Make doctor information available in all EJS templates
    }
    next();
});

//Function to fetch logged in doctor information
function fetchDoctorDetails(userEmail) {
    const doctor = doctors.find(d => d.email === userEmail);
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
    .get((req, res) => {
        const userType = req.session.userType;
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

app.route("/admin/appointment/create").get((req, res) => {
    const userType = req.session.userType;
    res.render("create_app", { doctors, userType });
}).post((req, res) => {
    let { name, email, contact, dob, age, gender, address, pincode, app_doc, app_date, reason, notes } = req.body;
    console.log(name, email, contact, dob, age, gender, address, pincode, app_doc, app_date, reason, notes);
    setTimeout(() => {
        res.redirect("/admin/appointment/manage");
    }, 1500);
})

app.get("/admin/appointment/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_app", { appointments, userType });
});

app.route("/admin/appointment/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let app = appointments.find(a => a.appointment_id === id);
    res.render("update_app", { app, doctors, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/appointment/manage");
    }, 1500);
})

app.route("/admin/pharmacy/add").get((req, res) => {
    const userType = req.session.userType;
    res.render("add_pharma", { userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/pharmacy/manage");
    }, 1500);
});

app.get("/admin/pharmacy/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_pharma", { pharmacies, userType });
});

app.route("/admin/pharmacy/manage/:bc").get((req, res) => {
    const userType = req.session.userType;
    let bc = req.params.bc;
    let pharma = pharmacies.find(p => p.pharmaceutical_barcode === Number(bc));
    res.render("update_pharma", { pharma, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/pharmacy/manage");
    }, 1500);
})

app.get("/admin/prescription/add", (req, res) => {
    const userType = req.session.userType;
    res.render("add_presc", { patients, userType });
});

app.route("/admin/prescription/add/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("add_new_presc", { patient, userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/prescription/manage");
    }, 1500);
})

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

app.route("/admin/prescription/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let presc = prescriptions.find(p => p.patient_id === id);
    res.render("update_presc", { patient, presc, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/prescription/manage");
    }, 1500);
})

app.get("/admin/lab/tests", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_test", { patients, userType });
})

app.route("/admin/lab/tests/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_test", { lab, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/lab/tests");
    }, 1500);
});

app.get("/admin/lab/results", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_lab_result", { patients, userType });
})

app.route("/admin/lab/results/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let lab = labReports.find(r => r.id === id);
    res.render("add_lab_result", { lab, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/lab/results");
    }, 1500);
});

app.get("/admin/patient/vitals", (req, res) => {
    const userType = req.session.userType;
    res.render("patient_vitals", { patients, userType });
});

app.route("/admin/patient/vitals/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    let lab = labReports.find(l => l.id === id);
    res.render("add_patient_vitals", { patient, lab, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/patient/vitals");
    }, 1500);
})

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

app.route("/admin/doctor/q").get((req, res) => {
    const userType = req.session.userType;
    res.render("view_doctor", { doctors, userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/doctor/q");
    }, 1500);
})

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

app.route("/admin/doctor/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let doctor = doctors.find(d => d.id === id);
    res.render("update_doctor", { doctor, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/doctor/manage");
    }, 1500);
})

app.route("/admin/patient/register").get((req, res) => {
    const userType = req.session.userType;
    res.render("register_patient", { userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/patient/q");
    }, 1500);
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

app.route("/admin/patient/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("update_patient", { patient, doctors, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/patient/manage");
    }, 1500);
})

app.get("/admin/patient/discharge", (req, res) => {
    const userType = req.session.userType;
    res.render("discharge_patient", { patients, userType });
});

app.route("/admin/patient/discharge/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let patient = patients.find(p => p.id === id);
    res.render("discharge_form", { patient, userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/patient/discharge");
    }, 1500);
})

app.route("/admin/employee/add").get((req, res) => {
    const userType = req.session.userType;
    res.render("add_employee", { userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/employee/q");
    }, 1500);
})

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

app.route("/admin/employee/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let employee = employees.find(e => e.employee_id === id);
    res.render("update_employee", { employee, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/employee/manage");
    }, 1500);
})

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

app.route("/admin/payroll/add/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let emp = employees.find(e => e.employee_id === id);
    res.render("add_new_payroll", { emp, userType });
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/payroll/add");
    }, 1500);
})

app.get("/admin/payroll/manage", (req, res) => {
    const userType = req.session.userType;
    res.render("manage_payroll", { employees, userType });
});

app.route("/admin/payroll/manage/:id").get((req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    let emp = employees.find(e => e.employee_id === id);
    res.render("update_payroll", { emp, userType });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/admin/payroll/manage");
    }, 1500);
})

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
            console.log(email, password); // Consider validating the email and password
            req.session.userEmail = email;
            req.session.userType = 'doctor';
            res.redirect("/doctor/dashboard");
        } catch (error) {
            res.status(400).send("Doctor login failed");
        }
    })
    .get(async (req, res) => {
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
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/appointment/manage");
    }, 1500);
})


app.get("/doctor/appointment/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("manage_app", { appointments, userType, doctor });
});

app.route("/doctor/appointment/manage/:id").get(async (req, res) => {
    const userType = req.session.userType;
    let id = req.params.id;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    let app = appointments.find(a => a.appointment_id === id);
    res.render("update_app", { app, doctors, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/appointment/manage");
    }, 1500);
})

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
}).post((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/pharmacy/manage");
    }, 1500);
});

app.get("/doctor/pharmacy/manage", async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.session.userEmail;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("manage_pharma", { pharmacies, userType, doctor });
});

app.route("/doctor/pharmacy/manage/:bc").get(async (req, res) => {
    const userType = req.session.userType;
    let bc = req.params.bc;
    const userEmail = req.session.userEmail;
    let pharma = pharmacies.find(p => p.pharmaceutical_barcode === Number(bc));
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("update_pharma", { pharma, userType, doctor });
}).patch((req, res) => {
    console.log(req.body);
    setTimeout(() => {
        res.redirect("/doctor/pharmacy/manage");
    }, 1500);
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
app.listen(port, () => {
    console.log("Port is listening on", port);
});

// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});

