const Discharge = require("../src/models/dischargeModel");
const Doctor = require("../src/models/docModel");
const LabReport = require("../src/models/labModel");
const Patient = require("../src/models/patientModel");
const { fetchAdminDetails } = require("../utils/helper");

module.exports.renderPatientVitalsTable = async (req, res) => {
  const userType = req.session.userType;
  const labs = await LabReport.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  const patients = await Patient.find({ treat_status: "Ongoing" });
  res.render("patient_vitals", { currUser, patients, labs, userType });
};

module.exports.renderVitalsUpdateForm = async (req, res) => {
  const userType = req.session.userType;
  const lab = await LabReport.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_patient_vitals", { currUser, lab, userType });
};

module.exports.updatePatientVitals = async (req, res) => {
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

    res.redirect(`/${req.user.role}/patient/vitals`);
  } catch (error) {
    res.status(500).send("Error updating Lab Tests");
  }
};

module.exports.renderPatientRegistrationForm = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("register_patient", { currUser, userType });
};

module.exports.registerPatient = async (req, res) => {
  const newPatient = new Patient(req.body);
  try {
    await newPatient.save();
    res.status(201).redirect(`/${req.user.role}/patient/q`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/patient/q`);
  }
};

module.exports.renderPatientTable = async (req, res) => {
  const userType = req.session.userType;
  const patients = await Patient.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("view_patient", { currUser, patients, userType });
};

module.exports.renderPatientDetails = async (req, res) => {
  const userType = req.session.userType;
  const patient = await Patient.findOne({ patient_id: req.params.id });
  const lab = await LabReport.findOne({ patient_id: req.params.id });
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("patient_profile", { currUser, patient, lab, userType });
};

module.exports.renderPatientManageTable = async (req, res) => {
  const userType = req.session.userType;
  const patients = await Patient.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_patient", { currUser, patients, userType });
};

module.exports.renderPatientUpdateForm = async (req, res) => {
  const userType = req.session.userType;
  const patient = await Patient.findById(req.params.id);
  const doctors = await Doctor.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("update_patient", { currUser, patient, doctors, userType });
};

module.exports.updatePatientDetails = async (req, res) => {
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

    res.redirect(`/${req.user.role}/patient/manage`);
  } catch (error) {
    res.status(500).send("Error updating Patient details");
  }
};

module.exports.deletePatient = async (req, res) => {
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
};

module.exports.renderDischargeTable = async (req, res) => {
  const userType = req.session.userType;
  const patients = await Patient.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("discharge_patient", { currUser, patients, userType });
};

module.exports.renderDischargeForm = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  const patient = await Patient.findOne({ patient_id: req.params.id });
  res.render("discharge_form", { currUser, patient, userType });
};

module.exports.dischargePatient = async (req, res) => {
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

    res.status(201).redirect(`/${req.user.role}/patient/discharge`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/patient/discharge`);
  }
};
