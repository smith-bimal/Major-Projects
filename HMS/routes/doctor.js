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
const { fetchDoctorDetails, fetchAdminDetails } = require("../utils/helper");


const doctorDashboardRoute = require("../routes/dashboardDoctor");
const appointmentRoute = require("./appointmentRoutes");
const pharmacyRoute = require("./pharmacyRoutes");
const prescriptionRoute = require("./prescriptionRoutes");

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


router.get(
  "/lab/tests",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_test", { patients, userType, doctor });
  }
);

router
  .route("/lab/tests/:id")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      const patient = await Patient.findOne({ patient_id: req.params.id });
      const lab = await LabReport.findOne({ patient_id: req.params.id });
      res.render("add_lab_test", { patient, lab, userType, doctor });
    }
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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

        res.redirect("/doctor/lab/tests");
      } catch (error) {
        res.status(500).send("Error updating Vitals data");
      }
    }
  );

router.get(
  "/lab/results",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { patients, labs, userType, doctor });
  }
);

router
  .route("/lab/results/:id")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const userEmail = req.user.email;
      const lab = await LabReport.findById(req.params.id);
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("add_lab_result", { lab, userType, doctor });
    }
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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

        res.redirect("/doctor/lab/results");
      } catch (error) {
        res.status(500).send("Error updating Lab Results");
      }
    }
  );

router.get(
  "/patient/vitals",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_vitals", { patients, labs, userType, doctor });
  }
);

router
  .route("/patient/vitals/:id")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const lab = await LabReport.findById(req.params.id);
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("add_patient_vitals", { lab, userType, doctor });
    }
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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

        res.redirect("/doctor/patient/vitals");
      } catch (error) {
        res.status(500).send("Error updating Lab Tests");
      }
    }
  );
router.get(
  "/lab/reports",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const labs = await LabReport.find({});
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { patients, labs, userType, doctor });
  }
);

router.get(
  "/lab/reports/:id",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("view_lab_report", { patient, lab, userType, doctor });
  }
);

router
  .route("/patient/register")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("register_patient", { userType, doctor });
    }
  )
  .post(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const newPatient = new Patient(req.body);
      try {
        await newPatient.save();
        res.status(201).redirect("/doctor/patient/q");
      } catch (error) {
        res.status(400).redirect("/doctor/patient/q");
      }
    }
  );

router.get(
  "/patient/q",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("view_patient", { patients, userType, doctor });
  }
);

router.get(
  "/patient/q/:id",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    res.render("patient_profile", { patient, lab, userType, doctor });
  }
);

router.get(
  "/patient/manage",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("manage_patient", { patients, userType, doctor });
  }
);

router
  .route("/patient/manage/:id")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const patient = await Patient.findById(req.params.id);
      const doctors = await Doctor.find({});
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("update_patient", { patient, doctors, userType, doctor });
    }
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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

        res.redirect("/doctor/patient/manage");
      } catch (error) {
        res.status(500).send("Error updating Patient details");
      }
    }
  )
  .delete(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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
    }
  );

router.get(
  "/patient/discharge",
  isAdminOrDoctor,
  isLoggedIn("doctor"),
  isAuthenticated,
  async (req, res) => {
    const userType = req.session.userType;
    const userEmail = req.user.email;
    const doctor = await fetchDoctorDetails(userEmail);
    const patients = await Patient.find({});
    res.render("discharge_patient", { patients, userType, doctor });
  }
);

router
  .route("/patient/discharge/:id")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
      const userType = req.session.userType;
      const patient = await Patient.findOne({ patient_id: req.params.id });
      const userEmail = req.user.email;
      const doctor = await fetchDoctorDetails(userEmail);
      res.render("discharge_form", { patient, userType, doctor });
    }
  )
  .post(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    async (req, res) => {
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
    }
  );

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
