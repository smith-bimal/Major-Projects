const express = require("express");
const router = express.Router();

const multer = require("multer");
const bcrypt = require("bcrypt");

const {
  isAdminOrDoctor,
  isAuthenticated,
  dynamicIsLoggedIn,
} = require("../utils/middlewares");

const Appointment = require("../src/models/appointmentModel");
const Patient = require("../src/models/patientModel");
const Doctor = require("../src/models/docModel");
const Employee = require("../src/models/employeeModel");
const LabReport = require("../src/models/labModel");
const Discharge = require("../src/models/dischargeModel");
const Payroll = require("../src/models/payrollModel");
const { fetchAdminDetails } = require("../utils/helper");
const adminDashboardRoute = require("../routes/dashboardAdmin");
const appointmentRoute = require("./appointmentRoutes");
const pharmacyRoute = require("./pharmacyRoutes");
const prescriptionRoute = require("./prescriptionRoutes");

//Image uploading configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("avatar");

router.use("/dashboard", adminDashboardRoute);
router.use("/appointment", appointmentRoute);
router.use("/pharmacy", pharmacyRoute);
router.use("/prescription", prescriptionRoute);


router.get(
  "/lab/tests",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({ treat_status: "Ongoing" });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("patient_lab_test", { currUser, patients, userType });
  }
);

router
  .route("/lab/tests/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_lab_test", { currUser, patient, lab, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
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
        return res.status(404).send("Vitals data not found");
      }

      res.redirect("/admin/lab/tests");
    } catch (error) {
      res.status(500).send("Error updating Vitals data");
    }
  });

router.get(
  "/lab/results",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { currUser, patients, labs, userType });
  }
);

router
  .route("/lab/results/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_lab_result", { currUser, lab, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const updatedLabResult = await LabReport.findByIdAndUpdate(
        req.params.id,
        {
          result_date: req.body.result_date,
          lab_results: req.body.results,
        },
        { new: true, runValidators: true }
      );

      if (!updatedLabResult) {
        return res.status(404).send("Lab Results not found");
      }

      res.redirect("/admin/lab/results");
    } catch (error) {
      res.status(500).send("Error updating Lab Results");
    }
  });

router.get(
  "/patient/vitals",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_vitals", { currUser, patients, labs, userType });
  }
);

router
  .route("/patient/vitals/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_patient_vitals", { currUser, lab, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const updatedLabTest = await LabReport.findByIdAndUpdate(
        req.params.id,
        {
          heart_rate: req.body.hr,
          blood_pressure: req.body.bp,
          temperature: req.body.temp,
          resp_rate: req.body.resp,
          oxygen_sat: req.body.spo2,
        },
        { new: true, runValidators: true }
      );

      if (!updatedLabTest) {
        return res.status(404).send("Lab tests not found");
      }

      res.redirect("/admin/patient/vitals");
    } catch (error) {
      res.status(500).send("Error updating Lab Tests");
    }
  });

router.get(
  "/lab/reports",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { currUser, patients, labs, userType });
  }
);

router.get(
  "/lab/reports/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("view_lab_report", { currUser, lab, patient, userType });
  }
);

router
  .route("/doctor/add")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_doctor", { currUser, userType });
  })
  .post(isAdminOrDoctor, dynamicIsLoggedIn, upload, async (req, res) => {
    const {
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
      password,
      notes,
      avatar,
    } = req.body;

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
          avatar: req.file.filename,
        });

        try {
          await newDoctor.save();
          res.status(201).redirect("/admin/doctor/q");
        } catch (error) {
          res.status(400).redirect("/admin/doctor/add");
        }
      });
    });
  });

router
  .route("/doctor/q")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("view_doctor", { currUser, doctors, userType });
  });

router.get(
  "/doctor/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    let doctor = await Doctor.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("doctor_profile", { currUser, doctor, userType });
  }
);

router.get(
  "/doctor/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const doctors = await Doctor.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("manage_doctor", { currUser, doctors, userType });
  }
);

router
  .route("/doctor/manage/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const userType = req.session.userType;
      const doctor = await Doctor.findById(req.params.id);
      const currUser = await fetchAdminDetails(req.user.email);

      if (!doctor) {
        return res.status(404).send("Doctor not found");
      }

      res.render("update_doctor", { currUser, doctor, userType });
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      res.status(500).send("Internal Server Error");
    }
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, upload, async (req, res) => {
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
        };
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
        };
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
        };
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedDoctor) {
        return res.status(404).send("Doctor not found");
      }

      res.redirect("/admin/doctor/manage");
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).send("Internal Server Error");
    }
  })
  .delete(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!deletedDoctor) {
        return res.status(404).send("Doctor not found");
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

router
  .route("/patient/register")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("register_patient", { currUser, userType });
  })
  .post(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const newPatient = new Patient(req.body);
    try {
      await newPatient.save();
      res.status(201).redirect("/admin/patient/q");
    } catch (error) {
      res.status(400).redirect("/admin/patient/q");
    }
  });

router.get(
  "/patient/q",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("view_patient", { currUser, patients, userType });
  }
);

router.get(
  "/patient/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("patient_profile", { currUser, patient, lab, userType });
  }
);

router.get(
  "/patient/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("manage_patient", { currUser, patients, userType });
  }
);

router
  .route("/patient/manage/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findById(req.params.id);
    const doctors = await Doctor.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("update_patient", { currUser, patient, doctors, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
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
          doc_assign: req.body.assign_doc,
        },
        { new: true, runValidators: true }
      );

      if (!updatedPatient) {
        return res.status(404).send("Patient details not found");
      }

      res.redirect("/admin/patient/manage");
    } catch (error) {
      res.status(500).send("Error updating Patient details");
    }
  })
  .delete(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
      await LabReport.findOneAndDelete({
        patient_id: deletedPatient.patient_id,
      });

      if (!deletedPatient) {
        return res.status(404).send("Patient not found");
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

router.get(
  "/patient/discharge",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("discharge_patient", { currUser, patients, userType });
  }
);

router
  .route("/patient/discharge/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    const patient = await Patient.findOne({ patient_id: req.params.id });
    res.render("discharge_form", { currUser, patient, userType });
  })
  .post(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
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

router
  .route("/employee/add")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_employee", { currUser, userType });
  })
  .post(isAdminOrDoctor, dynamicIsLoggedIn, upload, async (req, res) => {
    const newEmployee = new Employee({
      ...req.body,
      avatar: req.file.filename,
    });
    try {
      await newEmployee.save();
      res.status(201).redirect("/admin/employee/q");
    } catch (error) {
      res.status(400).redirect("/admin/employee/q");
    }
  });

router.get(
  "/employee/q",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("view_employee", { currUser, employees, userType });
  }
);

router.get(
  "/employee/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    const employee = await Employee.findById(req.params.id);
    res.render("employee_profile", { currUser, employee, userType });
  }
);

router.get(
  "/employee/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("manage_employee", { currUser, employees, userType });
  }
);

router
  .route("/employee/manage/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const employee = await Employee.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("update_employee", { currUser, employee, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, upload, async (req, res) => {
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
        notes: req.body.notes,
      };
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
        avatar: req.file.filename,
      };
    }

    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedEmployee) {
        return res.status(404).send("Employee details not found");
      }

      res.redirect("/admin/employee/manage");
    } catch (error) {
      res.status(500).send("Error updating Employee details");
    }
  })
  .delete(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      if (!deletedEmployee) {
        return res.status(404).send("Employee not found");
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

router.get(
  "/records/appointment",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const appointments = await Appointment.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("appointment_records", { currUser, appointments, userType });
  }
);

router.get(
  "/records/appointment/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = router.app_doc;
    const currUser = await fetchAdminDetails(req.user.email);
    let doc = await Doctor.findOne({ full_name: doctorName });
    res.render("appointment", { currUser, app, doc, userType });
  }
);

router.get(
  "/records/patient",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("patient_records", { currUser, patients, userType });
  }
);

router.get(
  "/records/patient/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let doctorName = patient.doc_assign;
    let doc = await Doctor.findOne({ full_name: doctorName });
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let discharge = await Discharge.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("patient_final_record", {
      admin,
      patient,
      doc,
      lab,
      discharge,
      userType,
    });
  }
);

router.get(
  "/payroll/add",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const employees = await Employee.find({});
    const payrolls = await Payroll.find({});
    const currUser = await fetchAdminDetails(req.user.email);

    // Create a Set of employee IDs that have salaries
    const employeeWithSalaries = new Set(
      payrolls.filter((p) => p.salary !== "").map((p) => p.employee_id)
    );

    // Filter employees that do not have a salary assigned
    const employeesWithoutSalaries = employees.filter(
      (e) => !employeeWithSalaries.has(e.employee_id)
    );

    res.render("add_payroll", {
      admin,
      payrolls,
      employees: employeesWithoutSalaries,
      userType,
    });
  }
);

router
  .route("/payroll/add/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    const emp = await Employee.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_new_payroll", { currUser, emp, userType });
  })
  .post(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const newPayroll = new Payroll(req.body);
    try {
      await newPayroll.save();
      res.status(201).redirect("/admin/payroll/manage");
    } catch (error) {
      res.status(400).redirect("/admin/payroll/add");
    }
  });

router.get(
  "/payroll/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const payrolls = await Payroll.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("manage_payroll", { currUser, payrolls, userType });
  }
);

router
  .route("/payroll/manage/:id")
  .get(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    const userType = req.session.userType;
    let payroll = await Payroll.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("update_payroll", { currUser, payroll, userType });
  })
  .patch(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
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
        return res.status(404).send("Employee Payroll details not found");
      }

      res.redirect("/admin/payroll/manage");
    } catch (error) {
      res.status(500).send("Error updating Employee payroll details");
    }
  })
  .delete(isAdminOrDoctor, dynamicIsLoggedIn, async (req, res) => {
    try {
      const deletedPayroll = await Payroll.findByIdAndDelete(req.params.id);
      if (!deletedPayroll) {
        return res.status(404).send("Payroll not found");
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

router.get(
  "/payroll/generate",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const employees = await Payroll.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("generate_payroll", { currUser, employees, userType });
  }
);

router.get(
  "/payroll/generate/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const payroll = await Payroll.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("employee_payslip", { currUser, payroll, userType });
  }
);

router.get(
  "/survey",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("survey", { currUser, userType });
  }
);

module.exports = router;
