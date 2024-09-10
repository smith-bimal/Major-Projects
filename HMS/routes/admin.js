const express = require("express");
const router = express.Router();

const adminDashboardRoute = require("../routes/dashboardAdmin");
const appointmentRoute = require("./appointmentRoutes");
const pharmacyRoute = require("./pharmacyRoutes");
const prescriptionRoute = require("./prescriptionRoutes");
const labRoute = require("./labRoutes");
const patientRoute = require("./patientRoutes");
const doctorRoute = require("./doctorRoutes");
const employeeRoute = require("./employeeRoutes");
const recordsRoute = require("./recordsRoutes");
const payrollRoute = require("./payrollRoutes");
const surveyRoute = require("./surveyRoutes");


router.use("/dashboard", adminDashboardRoute);
router.use("/appointment", appointmentRoute);
router.use("/pharmacy", pharmacyRoute);
router.use("/prescription", prescriptionRoute);
router.use("/lab", labRoute);
router.use("/patient", patientRoute);
router.use("/doctor", doctorRoute);
router.use("/employee", employeeRoute);
router.use("/records", recordsRoute);
router.use("/payroll", payrollRoute);
router.use("/survey", surveyRoute);

module.exports = router;
