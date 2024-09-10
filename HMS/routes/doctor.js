const express = require("express");
const router = express.Router();

const {
  isAdminOrDoctor,
  isLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");

const Appointment = require("../src/models/appointmentModel");
const Patient = require("../src/models/patientModel");
const Doctor = require("../src/models/docModel");
const LabReport = require("../src/models/labModel");
const Discharge = require("../src/models/dischargeModel");
const { fetchDoctorDetails } = require("../utils/helper");


const doctorDashboardRoute = require("../routes/dashboardDoctor");
const appointmentRoute = require("./appointmentRoutes");
const pharmacyRoute = require("./pharmacyRoutes");
const prescriptionRoute = require("./prescriptionRoutes");
const labRoute = require("./labRoutes");
const patientRoute = require("./patientRoutes");

const multer = require("multer");
const bcrypt = require("bcrypt");

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

router.use("/dashboard", doctorDashboardRoute);
router.use("/appointment", appointmentRoute);
router.use("/pharmacy", pharmacyRoute);
router.use("/prescription", prescriptionRoute);
router.use("/lab", labRoute);
router.use("/patient", patientRoute);

router.get(
  "/records/appointment",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const appointments = await Appointment.find({});
    res.render("appointment_records", { appointments, userType, doctor });
  }
);

router.get(
  "/records/appointment/:id",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    let app = await Appointment.findById(req.params.id);
    let doctorName = router.app_doc;
    let doc = await Doctor.findOne({ full_name: doctorName });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("appointment", { app, doc, userType, doctor });
  }
);

router.get(
  "/records/patient",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("patient_records", { patients, userType, doctor });
  }
);

router.get(
  "/records/patient/:id",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let doctorName = patient.doc_assign;
    let doc = await Doctor.findOne({ full_name: doctorName });
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let discharge = await Discharge.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_final_record", {
      patient,
      doc,
      lab,
      discharge,
      userType,
      doctor,
    });
  }
);

router.get(
  "/survey",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("survey", { userType, doctor });
  }
);

router
  .route("/profile")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("doc_profile_acc", { doctor, userType });
    }
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    upload,
    async (req, res) => {
      let updateData = {
        bio: req.body.bio,
        contact_number: req.body.contact,
        address: req.body.address,
        pincode: req.body.pincode,
        username: req.body.username,
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
          return res.status(404).send("Doctor not found");
        }

        res.redirect("/doctor/profile");
      } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  );

module.exports = router;
