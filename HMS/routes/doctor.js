const express = require("express");
const router = express.Router();

const doctorDashboardRoute = require("../routes/dashboardDoctor");
const appointmentRoute = require("./appointmentRoutes");
const pharmacyRoute = require("./pharmacyRoutes");
const prescriptionRoute = require("./prescriptionRoutes");
const labRoute = require("./labRoutes");
const patientRoute = require("./patientRoutes");
const recordsRoute = require("./recordsRoutes");
const surveyRoute = require("./surveyRoutes");
const profileRoute = require("./profileRoutes");

router.use("/dashboard", doctorDashboardRoute);
router.use("/appointment", appointmentRoute);
router.use("/prescription", prescriptionRoute);
router.use("/pharmacy", pharmacyRoute);
router.use("/lab", labRoute);
router.use("/patient", patientRoute);
router.use("/records", recordsRoute);
router.use("/survey", surveyRoute);
router.use("/profile", profileRoute);

module.exports = router;
