const Appointment = require("../src/models/appointmentModel");
const Pharmacy = require("../src/models/pharmacyModel");
const Patient = require("../src/models/patientModel");
const Doctor = require("../src/models/docModel");
const Employee = require("../src/models/employeeModel");
const LabReport = require("../src/models/labModel");
const { fetchDoctorDetails, fetchAdminDetails } = require("../utils/helper");

module.exports.doctorDashboard = async (req, res) => {
  const appointments = await Appointment.find({});
  const patients = await Patient.find({});
  const pharmacies = await Pharmacy.find({});
  const labReports = await LabReport.find({});
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("doctor", {
    userType,
    patients,
    appointments,
    pharmacies,
    labReports,
    currUser,
  });
};

module.exports.adminDashboard = async (req, res) => {
  const userType = req.session.userType;
  const appointments = await Appointment.find({});
  const pharmacies = await Pharmacy.find({});
  const patients = await Patient.find({});
  const ongoingPatients = await Patient.find({ treat_status: "Ongoing" });
  const employees = await Employee.find({});
  const doctors = await Doctor.find({});
  const activeDoctors = await Doctor.find({ status: "Online" });
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("admin", {
    currUser,
    employees,
    patients,
    ongoingPatients,
    appointments,
    doctors,
    activeDoctors,
    pharmacies,
    userType,
  });
};
