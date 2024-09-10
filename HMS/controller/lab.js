const LabReport = require("../src/models/labModel");
const Patient = require("../src/models/patientModel");
const { fetchAdminDetails } = require("../utils/helper");

module.exports.renderTestsTable = async (req, res) => {
    const userType = req.session.userType;
    const patients = await Patient.find({ treat_status: "Ongoing" });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("patient_lab_test", { currUser, patients, userType });
  }

  module.exports.renderTestForm = async (req, res) => {
    const userType = req.session.userType;
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const lab = await LabReport.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_lab_test", { currUser, patient, lab, userType });
  }

  module.exports.updateTests = async (req, res) => {
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

      res.redirect(`/${req.user.role}/lab/tests`);
    } catch (error) {
      res.status(500).send("Error updating Vitals data");
    }
  }


  module.exports.renderResultsTable = async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("patient_lab_result", { currUser, patients, labs, userType });
  }

  module.exports.renderResultsForm = async (req, res) => {
    const userType = req.session.userType;
    const lab = await LabReport.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("add_lab_result", { currUser, lab, userType });
  }

  module.exports.updateResults = async (req, res) => {
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

      res.redirect(`/${req.user.role}/lab/results`);
    } catch (error) {
      res.status(500).send("Error updating Lab Results");
    }
  }

  module.exports.renderReportsTable = async (req, res) => {
    const userType = req.session.userType;
    const labs = await LabReport.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    const patients = await Patient.find({ treat_status: "Ongoing" });
    res.render("lab_reports", { currUser, patients, labs, userType });
  }

  module.exports.renderLabReport = async (req, res) => {
    const userType = req.session.userType;
    let lab = await LabReport.findOne({ patient_id: req.params.id });
    let patient = await Patient.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("view_lab_report", { currUser, lab, patient, userType });
  }