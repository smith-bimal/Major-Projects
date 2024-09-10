const express = require("express");
const router = express.Router();
const path = require("path");

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
const labRoute = require("./labRoutes");
const patientRoute = require("./patientRoutes");
const doctorRoute = require("./doctorRoutes");

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
router.use("/lab", labRoute);
router.use("/patient", patientRoute);
router.use("/doctor", doctorRoute);

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
