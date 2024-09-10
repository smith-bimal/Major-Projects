const express = require("express");
const router = express.Router();

const Appointment = require("../src/models/appointmentModel");
const Discharge = require("../src/models/dischargeModel");
const Patient = require("../src/models/patientModel");
const { fetchAdminDetails } = require("../utils/helper");
const Doctor = require("../src/models/docModel");
const LabReport = require("../src/models/labModel");

module.exports.renderAppointmentRecordsTable = async (req, res) => {
  const userType = req.session.userType;
  const appointments = await Appointment.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("appointment_records", { currUser, appointments, userType });
};

module.exports.renderAppointmentRecordDetails = async (req, res) => {
  const userType = req.session.userType;
  let app = await Appointment.findById(req.params.id);
  let doctorName = app.app_doc;
  const currUser = await fetchAdminDetails(req.user.email);
  let doc = await Doctor.findOne({ full_name: doctorName });
  res.render("appointment", { currUser, app, doc, userType });
};

module.exports.renderPatientRecordsTable = async (req, res) => {
  const userType = req.session.userType;
  const patients = await Patient.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("patient_records", { currUser, patients, userType });
};

module.exports.renderPatientRecordDetails = async (req, res) => {
  const userType = req.session.userType;
  let patient = await Patient.findOne({ patient_id: req.params.id });
  let doctorName = patient.doc_assign;
  let doc = await Doctor.findOne({ full_name: doctorName });
  let lab = await LabReport.findOne({ patient_id: req.params.id });
  let discharge = await Discharge.findOne({ patient_id: req.params.id });
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("patient_final_record", {
    currUser,
    patient,
    doc,
    lab,
    discharge,
    userType,
  });
};
